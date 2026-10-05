import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { BaseEntity } from '../../../shared/db/base-entity.js';
import { Enterprise } from './enterprise.entity.js';

@Entity({ name: 'enterprise_configs' })
@Index(
  'uq_configs_database_ref_id_enterprise_ref_id',
  ['database', 'referenceId', 'enterprise'],
  { unique: true },
)
export class EnterpriseConfig extends BaseEntity {
  @Column('text', { name: 'host' })
  host: string;

  @Column('text', { name: 'port' })
  port: string;

  @Column('text', { name: 'database' })
  database: string;

  @Column('text', { name: 'reference_id' })
  referenceId: string;

  @ManyToOne(() => Enterprise, (enterprise) => enterprise.enterpriseConfigs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enterprise_ref_id' })
  enterprise: Enterprise;

  @RelationId((config: EnterpriseConfig) => config.enterprise)
  enterpriseRefId: string;

  get hostUrl(): string {
    return `http://${this.host}:${this.port}`;
  }
}
