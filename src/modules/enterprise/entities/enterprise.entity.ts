import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/db/base-entity.js';
import { EnterpriseConfig } from './enterprise-config.entity.js';

@Entity({ name: 'enterprises' })
export class Enterprise extends BaseEntity {
  @Column('text', { name: 'name' })
  name: string;

  @Column('text', { name: 'description', nullable: true })
  description?: string;

  @Column('text', { name: 'color', nullable: true })
  color?: string;

  @Column('text', { name: 'image', nullable: true })
  image?: string;

  @OneToMany(
    () => EnterpriseConfig,
    (enterpriseConfig) => enterpriseConfig.enterprise,
  )
  enterpriseConfigs: EnterpriseConfig[];
}
