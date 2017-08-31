import xlsx from 'node-xlsx'
import fs from 'fs'
import path from 'path'
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })

export default function myRouter(app) {
  app.all('/upload', upload.single('files'), function(req, res, next) {
    if (req.file) {
      let newFile = req.file.destination + req.file.originalname
      let oldFile = req.file.path
      fs.renameSync(oldFile, newFile)
      res.send('文件上传成功')
      req.context.filePath = newFile
      initExercise(req.context)
    } else {
      res.send('文件上传失败')
    }
  })

  app.get('/initModel', async (req, res) => {
    res.json({ code: '200', message: 'ok' })
    await initExercise(req.context)
  })
}

function replaceStr(str) {
  if (!str) return null
  let abcds = ['A', 'B', 'C', 'D', 'E']
  for (let key of abcds) {
    str = str
      .replace(key + '．', '')
      .replace(key + '、', '')
      .replace(key + '.', '')
  }
  return str.trim()
}

async function initExercise(context) {
  const filePath = context.filePath
  let RedCellDatas = xlsx.parse(filePath)[0].data
  let { Subject, Chapter, Section, Exercise, Answer, Analysis } = context
  let subjectName = RedCellDatas[1][0]
  let chapterNum = RedCellDatas[1][1]
  let chapterName = RedCellDatas[1][2]
  let sectionNum = RedCellDatas[1][3]
  let sectionName = RedCellDatas[1][4]

  Subject.collection.findOneAndUpdate({ name: subjectName }, { name: subjectName, createdAt: Date.now(), updatedAt: Date.now() }, { upsert: true })
  let subject = await Subject.collection.findOne({ name: subjectName })
  if (subject) {
    await Chapter.collection.findOneAndUpdate({ name: chapterName }, { name: chapterName, num: chapterNum, subjectId: subject._id, createdAt: Date.now(), updatedAt: Date.now() }, { upsert: true })
    let chapter = await Chapter.collection.findOne({ name: chapterName })
    if (chapter) {
      await Section.collection.findOneAndUpdate({ name: sectionName }, { name: sectionName, num: sectionNum, chapterId: chapter._id, createdAt: Date.now(), updatedAt: Date.now() }, { upsert: true })
      let section = await Section.collection.findOne({ name: sectionName })
      if (section) {
        let count = 0
        for (let RedCellData of RedCellDatas) {
          count++
          if (count === 1) continue
          let answers = []
          let exerciseNum = RedCellData[7]
          if (!RedCellData[8]) continue
          let exerciseContent = RedCellData[8].substring(RedCellData[8].indexOf('．') + 1).trim()
          let isAnswer = RedCellData[14]
          let analysis = RedCellData[15]
          for (let j = 9; j < 14; j++) {
            answers.push(replaceStr(RedCellData[j]))
          }
          let subjectId = subject._id
          let sectionId = section._id
          let exerciseInsert = {
            content: exerciseContent,
            num: exerciseNum,
            subjectId,
            sectionId,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
          await Exercise.collection.findOneAndUpdate({ num: exerciseNum, subjectId, sectionId }, exerciseInsert, { upsert: true })
          let exerciseHas = await Exercise.collection.findOne({ num: exerciseNum, subjectId, sectionId })
          if (exerciseHas) {
            for (let k = 0; k < answers.length; k++) {
              if (k + 1 === isAnswer) {
                await Answer.insert({ content: answers[k], isAnswer: true, exerciseId: exerciseHas._id })
              } else {
                await Answer.insert({ content: answers[k], isAnswer: false, exerciseId: exerciseHas._id })
              }
            }
            if (analysis && analysis.trim()) {
              await Analysis.insert({ content: analysis, exerciseId: exerciseHas._id })
            }
          }
        }
      }
    }
  }
}
