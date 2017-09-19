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

  app.all('/uploadReal', upload.single('files'), async function(req, res, next) {
    console.log('uploadReal')
    const examinationDifficultyId = req.query.examinationDifficultyId
    const yearExerciseTypeId = req.query.yearExerciseTypeId
    let year = req.query.year
    if (!examinationDifficultyId || !yearExerciseTypeId || !year) return res.json('参数错误')
    year = year * 1
    if (req.file) {
      try {
        let newFile = req.file.destination + req.file.originalname
        let oldFile = req.file.path
        fs.renameSync(oldFile, newFile)
        req.context.filePath = newFile
        await initRealExercise(req.context, examinationDifficultyId, yearExerciseTypeId, year, res)
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

  app.get('/updateExerciseDiff', async (req, res) => {
    // const { Exercise } = req.context
    // await Exercise.collection.updateMany({}, { $set: { examinationDifficultyId: ObjectId('59ab935b21d1ae0bf21deb02') } })
    res.json({ code: '200', message: 'ok' })
  })

  app.get('/updateExerciseType', async (req, res) => {
    // const { Exercise } = req.context
    // await Exercise.collection.updateMany({}, { $set: { type: '01' } })
    res.json({ code: '200', message: 'ok' })
  })

  app.get('/initCAndSDiffcult', async (req, res) => {
    // const { Exercise, Section, SectionWithDiffculty, ChapterWithDiffculty } = req.context
    // let exercises = await Exercise.collection.find().toArray()
    // for (let exercise of exercises) {
    //   const { examinationDifficultyId, sectionId } = exercise
    //   if (!sectionId || !examinationDifficultyId) continue
    //   await SectionWithDiffculty.collection.findOneAndUpdate({ examinationDifficultyId, sectionId }, { examinationDifficultyId, sectionId, createdAt: Date.now(), updatedAt: Date.now() }, { upsert: true })
    //   const section = await Section.findOneById(sectionId)
    //   const { chapterId } = section
    //   await ChapterWithDiffculty.collection.findOneAndUpdate({ examinationDifficultyId, chapterId }, { examinationDifficultyId, chapterId, createdAt: Date.now(), updatedAt: Date.now() }, { upsert: true })
    // }
    res.json({ code: '200', message: 'ok' })
  })

  app.get('/initYearExerciseType', async (req, res) => {
    // const { YearExerciseList, YearExerciseType } = req.context
    // let yearExerciseLists = await YearExerciseList.collection.find().toArray()
    // for (let obj of yearExerciseLists) {
    //   YearExerciseType
    // }
    res.json({ code: '200', message: 'ok' })
  })

  app.get('/initUserExerciseCount', async (req, res) => {
    const { User, UserAnswer } = req.context
    let users = await User.collection.find().toArray()
    for (let user of users) {
      let countUserAnswer = await UserAnswer.collection.count({ userId: user._id })
      let countRightUserAnswer = await UserAnswer.collection.count({ userId: user._id, isAnswer: true })
      await User.updateById(user._id, { countUserAnswer, countRightUserAnswer })
    }
    res.json({ code: '200', message: 'ok' })
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

async function initRealExercise(context, examinationDifficultyId, yearExerciseTypeId, year, res) {
  const filePath = context.filePath
  let RedCellDatas = xlsx.parse(filePath)[0].data
  if (!year) return res.send('年份不能为空!')
  await insertRealExercise(context, { RedCellDatas, examinationDifficultyId, yearExerciseTypeId, year })
  res.send('文件上传成功')
}

async function initSectionExercise(context, examinationDifficultyId, res) {
  const filePath = context.filePath
  let RedCellDatas = xlsx.parse(filePath)[0].data
  let { Subject, Chapter, Section, SubjectWithDiffculty, SectionWithDiffculty, ChapterWithDiffculty } = context
  let subjectTitle = RedCellDatas[0][0].toString().trim()
  if (subjectTitle !== '科目') return res.send('文件第一行必须为 标题 （科目，章序号，章 、、、）')
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

  let subjectWithDiffculty = {
    subjectId,
    examinationDifficultyId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  await SubjectWithDiffculty.collection.findOneAndUpdate({ subjectId, examinationDifficultyId }, subjectWithDiffculty, { upsert: true })

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
    await ChapterWithDiffculty.collection.findOneAndUpdate(
      { examinationDifficultyId, chapterId },
      { examinationDifficultyId, chapterId, createdAt: Date.now(), updatedAt: Date.now() },
      { upsert: true }
    )
    await SectionWithDiffculty.collection.findOneAndUpdate(
      { examinationDifficultyId, sectionId },
      { examinationDifficultyId, sectionId, createdAt: Date.now(), updatedAt: Date.now() },
      { upsert: true }
    )
    await insertExercise(context, { subjectId, sectionId, RedCellDatas, examinationDifficultyId })
  }
  res.send('文件上传成功')
}

async function insertRealExercise(context, { RedCellDatas, examinationDifficultyId, yearExerciseTypeId, year }) {
  const { Exercise, YearExerciseList } = context
  examinationDifficultyId = ObjectId(examinationDifficultyId)
  yearExerciseTypeId = ObjectId(yearExerciseTypeId)
  let yearExerciseListResult = await YearExerciseList.collection.findOneAndUpdate(
    { yearExerciseTypeId, year },
    { yearExerciseTypeId, year, createdAt: Date.now(), updatedAt: Date.now() },
    { upsert: true }
  )
  const yearExerciseListId = getInsertId(yearExerciseListResult)
  let num = 0
  for (let RedCellData of RedCellDatas) {
    if (!RedCellData[0]) continue
    num++
    let exerciseContent = trimExerciseContent(RedCellData[0])
    let exerciseInsert = {
      content: exerciseContent,
      num,
      examinationDifficultyId,
      yearExerciseListId,
      type: '02',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    let upsertResult = await Exercise.collection.findOneAndUpdate({ num, yearExerciseListId, examinationDifficultyId, type: '02' }, exerciseInsert, { upsert: true })
    const exerciseId = getInsertId(upsertResult)
    await insertAnswers(context, { exerciseId, RedCellData, begin: 1 })
    await insertAnalysis(context, { exerciseId, RedCellData, begin: 7 })
  }
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
      type: '01',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    let upsertResult = await Exercise.collection.findOneAndUpdate({ num: exerciseNum, subjectId, sectionId, examinationDifficultyId, type: '01' }, exerciseInsert, { upsert: true })
    const exerciseId = getInsertId(upsertResult)
    await insertAnswers(context, { exerciseId, RedCellData })
    await insertAnalysis(context, { exerciseId, RedCellData })
  }
}

function formatAnswer(str) {
  if (!str) return 0
  str = str.toString().trim()
  let match = str.match(/^[0-9]*$/)
  if (match) {
    return str * 1
  }
  let keys = { A: 1, B: 2, C: 3, D: 4, E: 5 }
  match = str.match(/[A-E]/)
  if (match) {
    return keys[match[0]]
  }
  return 0
}

async function insertAnswers(context, { exerciseId, RedCellData, begin = 9 }) {
  const { Answer } = context
  let isAnswer = formatAnswer(RedCellData[begin + 5])
  let answers = []
  for (let j = begin; j < begin + 5; j++) {
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

async function insertAnalysis(context, { exerciseId, RedCellData, begin = 15 }) {
  const { Analysis } = context
  if (RedCellData.length < begin + 1) return
  let analysiss = []
  for (let j = begin; j < RedCellData.length; j++) {
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
