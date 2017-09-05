import xlsx from 'node-xlsx'
import fs from 'fs'
import { ObjectId } from 'mongodb'
// import path from 'path'
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })

export default function myRouter(app) {
  app.all('/upload', upload.single('files'), async function(req, res, next) {
    const examinationDifficultyId = req.query.examinationDifficultyId
    if (!examinationDifficultyId) return res.json('参数错误')
    if (req.file) {
      try {
        let newFile = req.file.destination + req.file.originalname
        let oldFile = req.file.path
        fs.renameSync(oldFile, newFile)
        req.context.filePath = newFile
        await initSectionExercise(req.context, examinationDifficultyId, res)
      } catch (e) {
        console.log(e)
        res.send('文件上传失败')
      }
    } else {
      res.send('文件上传失败')
    }
  })

  app.get('/initModel', async (req, res) => {
    res.json({ code: '200', message: 'ok' })
    await initSectionExercise(req.context)
  })
}

function replaceStr(str) {
  if (!str) return null
  str = str + ''
  str = str.trim()
  let match = str.match(/^[A-Z]+[．、.]/)
  if (!match) return str.trim()
  return str.replace(match[0], '').trim()
}

function getInsertId(upsertResult) {
  const { lastErrorObject, value } = upsertResult
  let insertId
  if (value) {
    insertId = value._id
  } else {
    insertId = lastErrorObject.upserted
  }
  return insertId
}

function trimExerciseContent(str) {
  str = str + ''
  str = str.trim()
  let match = str.match(/^[0-9]+[．、.]/)
  if (!match) {
    return str.trim()
  }
  return str.replace(match[0], '').trim()
}

async function initSectionExercise(context, examinationDifficultyId, res) {
  const filePath = context.filePath
  let RedCellDatas = xlsx.parse(filePath)[0].data
  let { Subject, Chapter, Section, SubjectWithDiffculty } = context
  let subjectName = RedCellDatas[1][0]
  let chapterNum = RedCellDatas[1][1]
  let chapterName = RedCellDatas[1][2]
  let sectionNum = RedCellDatas[1][3]
  let sectionName = RedCellDatas[1][4]

  if (!subjectName || !subjectName.trim()) return res.send('文件格式不正确，科目名称必须')
  if (!chapterNum || !chapterNum * 1) return res.send('文件格式不正确，章 序号必须')
  if (!chapterName || !chapterName.trim()) return res.send('文件格式不正确，章 名称必须')
  if (!sectionNum || !sectionNum * 1) return res.send('文件格式不正确，节 序号 必须')
  if (!sectionName || !sectionName.trim()) return res.send('文件格式不正确，节 名称必须')

  subjectName = subjectName.trim()
  chapterNum = chapterNum * 1
  chapterName = chapterName.trim()
  sectionNum = sectionNum * 1
  sectionName = sectionName.trim()

  let subjectResult = await Subject.collection.findOneAndUpdate({ name: subjectName }, { name: subjectName, createdAt: Date.now(), updatedAt: Date.now() }, { upsert: true })
  let subjectId = getInsertId(subjectResult)

  examinationDifficultyId = ObjectId(examinationDifficultyId)

  let examinationDifficulty = {
    subjectId,
    examinationDifficultyId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  await SubjectWithDiffculty.collection.findOneAndUpdate({ subjectId, examinationDifficultyId }, examinationDifficulty, { upsert: true })

  let chapterResult = await Chapter.collection.findOneAndUpdate(
    { num: chapterNum, subjectId },
    { name: chapterName, num: chapterNum, subjectId, createdAt: Date.now(), updatedAt: Date.now() },
    { upsert: true }
  )
  let chapterId = getInsertId(chapterResult)
  let sectionResult = await Section.collection.findOneAndUpdate(
    { chapterId, num: sectionNum },
    { name: sectionName, num: sectionNum, chapterId, createdAt: Date.now(), updatedAt: Date.now() },
    { upsert: true }
  )
  let sectionId = getInsertId(sectionResult)
  if (subjectId && chapterId && sectionId) {
    await insertExercise(context, { subjectId, sectionId, RedCellDatas, examinationDifficultyId })
  }
  res.send('文件上传成功')
}

async function insertExercise(context, { subjectId, sectionId, RedCellDatas, examinationDifficultyId }) {
  const { Exercise } = context
  let count = 0
  for (let RedCellData of RedCellDatas) {
    count++
    if (count === 1) continue
    if (!RedCellData[7]) continue
    let exerciseNum = RedCellData[7]
    if (!exerciseNum || !exerciseNum * 1) continue
    if (!RedCellData[8]) continue
    let exerciseContent = trimExerciseContent(RedCellData[8])
    let exerciseInsert = {
      content: exerciseContent,
      num: exerciseNum,
      subjectId,
      sectionId,
      examinationDifficultyId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    let upsertResult = await Exercise.collection.findOneAndUpdate({ num: exerciseNum, subjectId, sectionId, examinationDifficultyId }, exerciseInsert, { upsert: true })
    const exerciseId = getInsertId(upsertResult)
    await insertAnswers(context, { exerciseId, RedCellData })
    await insertAnalysis(context, { exerciseId, RedCellData })
  }
}

async function insertAnswers(context, { exerciseId, RedCellData }) {
  const { Answer } = context
  let isAnswer = RedCellData[14]
  let answers = []
  for (let j = 9; j < 14; j++) {
    answers.push(replaceStr(RedCellData[j]))
  }
  for (let k = 0; k < answers.length; k++) {
    let answerInsert = {
      content: answers[k],
      isAnswer: false,
      exerciseId,
      num: k + 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    if (k + 1 === isAnswer) answerInsert.isAnswer = true
    await Answer.collection.findOneAndUpdate({ exerciseId, num: k + 1 }, answerInsert, { upsert: true })
  }
}

async function insertAnalysis(context, { exerciseId, RedCellData }) {
  const { Analysis } = context
  if (RedCellData.length < 16) return
  let analysiss = []
  for (let j = 15; j < RedCellData.length; j++) {
    if (RedCellData[j]) {
      let content = RedCellData[j] + ''
      content = content.trim()
      if (content) {
        analysiss.push(content)
      }
    }
  }
  if (analysiss.length === 0) return
  for (let k = 0; k < analysiss.length; k++) {
    const analysisInsert = {
      content: analysiss[k],
      exerciseId,
      num: k + 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    await Analysis.collection.findOneAndUpdate({ exerciseId, num: k + 1 }, analysisInsert, { upsert: true })
  }
}
