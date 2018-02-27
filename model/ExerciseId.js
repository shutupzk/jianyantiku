import DataLoader from 'dataloader'
import findByIds from 'mongo-find-by-ids'

export default class ExerciseId {
  constructor(context) {
    this.context = context
    this.collection = context.db.collection('exerciseId')
    this.loader = new DataLoader(ids => findByIds(this.collection, ids))
  }
}
