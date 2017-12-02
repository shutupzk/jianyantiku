import xlsx from 'node-xlsx'
import fs from 'fs'
import { ObjectId } from 'mongodb'
// import path from 'path'
import qiniu from 'qiniu'
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })

export default function myRouter(app) {
  app.all('/qiniu/fileUploadToken', (req, res) => {
    let key = req.query.key || req.body.key || null
    if (!key) return res.json({ code: 'err', data: {}, msg: '缺少参数 key ' })
    const accessKey = 'zuEkahFX8kQ9V7gIEHybe8eeCiS57t2D61Eddp-O'
    const secretKey = 'PiuPXx8-MsZKW0-BYI6VDGA1samxSAiRYoFsoUeB'
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    let putPolicy = new qiniu.rs.PutPolicy({ scope: 'wenrun:' + key })
    res.json({ token: putPolicy.uploadToken(mac), expires: putPolicy.expires })
  })
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
    const yearExamTypeId = req.query.yearExamTypeId
    let year = req.query.year
    if (!examinationDifficultyId || !yearExerciseTypeId || !year || !yearExamTypeId) return res.json('参数错误')
    year = year * 1
    if (req.file) {
      try {
        let newFile = req.file.destination + req.file.originalname
        let oldFile = req.file.path
        fs.renameSync(oldFile, newFile)
        req.context.filePath = newFile
        await initRealExercise(req.context, { examinationDifficultyId, yearExerciseTypeId, year, yearExamTypeId }, res)
      } catch (e) {
        console.log(e)
        res.send('文件上传失败')
      }
    } else {
      res.send('文件上传失败')
    }
  })

  app.all('/uploadHot', upload.single('files'), async function(req, res, next) {
    // console.log('uploadHot')
    // const examinationDifficultyId = req.query.examinationDifficultyId
    // const subjectId = req.query.subjectId
    // if (!examinationDifficultyId || !subjectId) return res.json('参数错误')
    // if (req.file) {
    //   try {
    //     let newFile = req.file.destination + req.file.originalname
    //     let oldFile = req.file.path
    //     fs.renameSync(oldFile, newFile)
    //     req.context.filePath = newFile
    //     await initHotExercise(req.context, { examinationDifficultyId, subjectId }, res)
    //   } catch (e) {
    //     console.log(e)
    //     res.send('文件上传失败')
    //   }
    // } else {
    //   res.send('文件上传失败')
    // }
    const examinationDifficultyId = req.query.examinationDifficultyId
    if (!examinationDifficultyId) return res.json('参数错误')
    if (req.file) {
      try {
        let newFile = req.file.destination + req.file.originalname
        let oldFile = req.file.path
        fs.renameSync(oldFile, newFile)
        req.context.filePath = newFile
        await initSectionExercise(req.context, examinationDifficultyId, res, true)
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

  app.get('/initYearExamType', async (req, res) => {
    // const { YearHasType, Exercise } = req.context
    // const yearExamTypeId = ObjectId('59c481c7f1182b07d2c310b5')
    // const yearExerciseListId = ObjectId('59b575bca335d65c4e0a5355')

    // let yearHasTypeResult = await YearHasType.collection.findOneAndUpdate(
    //   { yearExerciseListId, yearExamTypeId },
    //   { yearExerciseListId, yearExamTypeId, createdAt: Date.now(), updatedAt: Date.now() },
    //   { upsert: true }
    // )
    // const yearHasTypeId = getInsertId(yearHasTypeResult)
    // await Exercise.collection.update({ yearExerciseListId }, { $set: { yearHasTypeId, yearExamTypeId } })
    const { Exercise } = req.context
    await Exercise.collection.update({ type: '01' }, { $set: { yearHasTypeId: null } })
    res.json({ code: '200', message: 'ok' })
  })

  app.get('/initUserAnswer', async (req, res) => {
    const { UserAnswer, Answer } = req.context
    let userAnswers = await UserAnswer.collection.find({}).toArray()
    for (let userAnswer of userAnswers) {
      const { answerId } = userAnswer
      let answer = await Answer.findOneById(answerId)
      if (answer) {
        const { exerciseId } = answer
        await UserAnswer.updateById(userAnswer._id, { exerciseId })
      } else {
        await UserAnswer.removeById(userAnswer._id)
      }
    }
    res.json({ code: '200', message: 'ok' })
  })

  app.get('/initRateOfSection', async (req, res) => {
    const { RateOfProgressOfSection } = req.context
    await RateOfProgressOfSection.collection.deleteMany({ examinationDifficultyId: { $exists: false } })
    res.json({ code: '200', message: 'ok' })
  })

  app.get('/updateExerciseRate', async (req, res) => {
    const { Exercise, UserAnswer, Answer } = req.context
    const exercises = await Exercise.collection.find({}).toArray()
    for (let exercise of exercises) {
      await updateExercise(Exercise, UserAnswer, Answer, exercise)
    }
    res.json({ code: '200', message: 'ok' })
  })
}

async function updateExercise(Exercise, UserAnswer, Answer, exercise) {
  try {
    const exerciseId = exercise._id
    let answerCount = await UserAnswer.collection.count({ exerciseId })
    let rightCount = await UserAnswer.collection.count({ exerciseId, isAnswer: true })
    const answers = await Answer.collection.find({ exerciseId }).toArray()
    const userAnswers = await UserAnswer.collection.find({ exerciseId, isAnswer: false }).toArray()
    let keys = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0
    }
    let keyArray = ['A', 'B', 'C', 'D', 'E']
    let anserkeys = {}
    for (let i = 0; i < answers.length; i++) {
      let answer = answers[i]
      anserkeys[answer._id] = keyArray[i]
    }
    for (let answer of userAnswers) {
      keys[anserkeys[answer.answerId]]++
    }
    let normalErrorAnswer = ''
    let length = 0
    for (let key in keys) {
      if (keys[key] > length) {
        length = keys[key]
        normalErrorAnswer = key
      }
    }

    let all = await UserAnswer.collection.count({ exerciseId: exercise._id })
    let right = await UserAnswer.collection.count({ exerciseId: exercise._id, isAnswer: true })
    let rightRate = Math.round(right / all * 100)
    console.log(exerciseId, answerCount, rightCount, normalErrorAnswer, rightRate)
    Exercise.updateById(exerciseId, { answerCount, rightCount, normalErrorAnswer, rightRate })
  } catch (e) {
    console.log(e)
  }
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

async function initRealExercise(context, { examinationDifficultyId, yearExerciseTypeId, year, yearExamTypeId }, res) {
  const filePath = context.filePath
  let RedCellDatas = xlsx.parse(filePath)[0].data
  if (!year) return res.send('年份不能为空!')
  await insertRealExercise(context, { RedCellDatas, examinationDifficultyId, yearExerciseTypeId, year, yearExamTypeId })
  res.send('文件上传成功')
}

async function initHotExercise(context, { examinationDifficultyId, subjectId }, res) {
  const filePath = context.filePath
  let RedCellDatas = xlsx.parse(filePath)[0].data
  await insertHotExercise(context, { RedCellDatas, examinationDifficultyId, subjectId }, res)
  res.send('文件上传成功')
}

async function initSectionExercise(context, examinationDifficultyId, res, hot) {
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
  let subjectSets = { hot, name: subjectName, createdAt: Date.now(), updatedAt: Date.now() }
  if (hot) subjectSets.hot = hot
  let subjectResult = await Subject.collection.findOneAndUpdate({ name: subjectName }, { $set: subjectSets }, { upsert: true })
  let subjectId = getInsertId(subjectResult)

  examinationDifficultyId = ObjectId(examinationDifficultyId)

  let subjectWithDiffculty = {
    subjectId,
    examinationDifficultyId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  await SubjectWithDiffculty.collection.findOneAndUpdate({ subjectId, examinationDifficultyId }, subjectWithDiffculty, { upsert: true })

  let chapterSet = { name: chapterName, num: chapterNum, subjectId, createdAt: Date.now(), updatedAt: Date.now() }
  if (hot) chapterSet.hot = hot
  let chapterResult = await Chapter.collection.findOneAndUpdate({ num: chapterNum, subjectId }, { $set: chapterSet }, { upsert: true })
  let chapterId = getInsertId(chapterResult)

  let sectionSet = { name: sectionName, num: sectionNum, chapterId, createdAt: Date.now(), updatedAt: Date.now() }
  if (hot) sectionSet.hot = hot
  let sectionResult = await Section.collection.findOneAndUpdate({ chapterId, num: sectionNum }, { $set: sectionSet }, { upsert: true })
  let sectionId = getInsertId(sectionResult)
  if (subjectId && chapterId && sectionId) {
    await ChapterWithDiffculty.collection.findOneAndUpdate({ examinationDifficultyId, chapterId }, { examinationDifficultyId, chapterId, createdAt: Date.now(), updatedAt: Date.now() }, { upsert: true })
    await SectionWithDiffculty.collection.findOneAndUpdate({ examinationDifficultyId, sectionId }, { examinationDifficultyId, sectionId, createdAt: Date.now(), updatedAt: Date.now() }, { upsert: true })
    await insertExercise(context, { subjectId, sectionId, RedCellDatas, examinationDifficultyId, hot })
  }
  res.send('文件上传成功')
}

async function insertHotExercise(context, { RedCellDatas, examinationDifficultyId, subjectId }, res) {
  const { SubjectWithDiffculty, Exercise } = context
  examinationDifficultyId = ObjectId(examinationDifficultyId)
  subjectId = ObjectId(subjectId)

  let subjectWithDiffculty = {
    subjectId,
    examinationDifficultyId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  await SubjectWithDiffculty.collection.findOneAndUpdate({ subjectId, examinationDifficultyId }, subjectWithDiffculty, { upsert: true })
  let num = 0
  for (let RedCellData of RedCellDatas) {
    if (!RedCellData[0]) continue
    num++
    let exerciseContent = trimExerciseContent(RedCellData[0])
    let exerciseInsert = {
      content: exerciseContent,
      num,
      examinationDifficultyId,
      subjectId,
      hot: true,
      type: '03',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    let upsertResult = await Exercise.collection.findOneAndUpdate({ num, subjectId, examinationDifficultyId, type: '03' }, exerciseInsert, { upsert: true })
    const exerciseId = getInsertId(upsertResult)
    await insertAnswers(context, { exerciseId, RedCellData, begin: 1 })
    await insertAnalysis(context, { exerciseId, RedCellData, begin: 7 })
  }
}

async function insertRealExercise(context, { RedCellDatas, examinationDifficultyId, yearExerciseTypeId, year, yearExamTypeId }) {
  const { Exercise, YearExerciseList, YearHasType } = context
  examinationDifficultyId = ObjectId(examinationDifficultyId)
  yearExerciseTypeId = ObjectId(yearExerciseTypeId)
  yearExamTypeId = ObjectId(yearExamTypeId)
  let yearExerciseListResult = await YearExerciseList.collection.findOneAndUpdate({ yearExerciseTypeId, year }, { yearExerciseTypeId, year, createdAt: Date.now(), updatedAt: Date.now() }, { upsert: true })
  const yearExerciseListId = getInsertId(yearExerciseListResult)

  let yearHasTypeResult = await YearHasType.collection.findOneAndUpdate({ yearExerciseListId, yearExamTypeId }, { yearExerciseListId, yearExamTypeId, createdAt: Date.now(), updatedAt: Date.now() }, { upsert: true })
  const yearHasTypeId = getInsertId(yearHasTypeResult)

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
      yearHasTypeId,
      yearExamTypeId,
      type: '02',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    let upsertResult = await Exercise.collection.findOneAndUpdate({ num, yearExerciseListId, examinationDifficultyId, type: '02', yearHasTypeId }, exerciseInsert, { upsert: true })
    const exerciseId = getInsertId(upsertResult)
    await insertAnswers(context, { exerciseId, RedCellData, begin: 1 })
    await insertAnalysis(context, { exerciseId, RedCellData, begin: 7 })
  }
}

async function insertExercise(context, { subjectId, sectionId, RedCellDatas, examinationDifficultyId, hot = false }) {
  const { Exercise } = context
  let count = 0
  let type = '01'
  if (hot) {
    type = '03'
  }
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
      type,
      hot,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    let upsertResult = await Exercise.collection.findOneAndUpdate({ num: exerciseNum, subjectId, sectionId, examinationDifficultyId }, exerciseInsert, { upsert: true })
    const exerciseId = getInsertId(upsertResult)
    await insertAnswers(context, { exerciseId, RedCellData })
    await insertAnalysis(context, { exerciseId, RedCellData, exerciseNum })
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

async function insertAnalysis(context, { exerciseId, RedCellData, begin = 15, exerciseNum }) {
  const { Analysis } = context
  await Analysis.collection.deleteMany({ exerciseId })
  if (RedCellData.length < begin + 1) return
  let analysiss = []
  for (let j = begin; j < begin + 1; j++) {
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
      adopt: '1',
      num: k + 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    await Analysis.collection.findOneAndUpdate({ exerciseId, num: k + 1 }, analysisInsert, { upsert: true })
  }
}
