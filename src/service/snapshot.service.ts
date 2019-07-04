export default class SnapshotService {
  private app: any

  constructor(app: any) {
    this.app = app
  }

  createSnapshot = (data: any) => {
    return this.app.sequelize.models.Image.create(data)
  }

  deleteSnapshot(id: string) {
    return this.app.sequelize.models.Image.destroy({
      where: {
        id: id
      }
    })
  }

  getSnapshot(id: string) {
    return this.app.sequelize.models.Image.findOne({
      where: {
        id: id
      }
    })
  }
}