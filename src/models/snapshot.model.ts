import {Table, Column, Model, HasMany, DataType, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript'

@Table({
  tableName: 'snap_image',
  paranoid: true,
  freezeTableName: true
})
export default class Image extends Model<Image> {

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: '',
    primaryKey: true,
    comment: "图片id"
  })
  id: string

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    comment: "地址"
  })
  snap_url: string

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    comment: "预览地址"
  })
  preview_url: string

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    comment: "文件名"
  })
  file_name: string

  @Column({
    type: DataType.INTEGER(1),
    allowNull: true,
    comment: "截图戳 0 - 生成完毕 1 - 生成失败 2 - 已被清理"
  })
  img_flag: string

  @CreatedAt
  create_time: Date

  @UpdatedAt
  update_time: Date

  @DeletedAt
  delete_time: Date

}