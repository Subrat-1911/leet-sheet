#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/7fdb9e1c3420f270323e843ef8966914ea00c819750916057254966727e0cd24/contract';
import startContract from '../../snapshots/7fdb9e1c3420f270323e843ef8966914ea00c819750916057254966727e0cd24/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/93c513d6f063125a7f13f0f011f05c798081d78c74336967efb44c47a73553f2/contract';
import endContract from '../../snapshots/93c513d6f063125a7f13f0f011f05c798081d78c74336967efb44c47a73553f2/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      
      this.dropConstraint({
        schema: 'public',
        table: 'problem',
        constraint: 'problem_topicId_fkey',
        kind: 'foreignKey',
      }),
      this.dropIndex({ schema: 'public', table: 'problem', index: 'problem_topicId_idx_6f05808f' }),
      this.dropColumn({
        schema: 'public',
        table: 'problem',
        column: 'topicId',
      }),

      this.dropTable({
        schema: 'public',
        table: 'topic',
      }),

      this.dropTable({
        schema: 'public',
        table: 'category',
      }),
      this.addColumn({
        schema: 'public',
        table: 'section',
        column: col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'section',
        column: col('parentId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'problem',
        column: col('sectionId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      
      this.setNotNull({ schema: 'public', table: 'problem', column: 'sectionId' }),
      this.createIndex({
        schema: 'public',
        table: 'problem',
        index: 'problem_sectionId_idx_5d1ea56b',
        columns: ['sectionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'section',
        index: 'section_parentId_idx_6a68f597',
        columns: ['parentId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'problem',
        foreignKey: {
          name: 'problem_sectionId_fkey',
          columns: ['sectionId'],
          references: { schema: 'public', table: 'section', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'section',
        foreignKey: {
          name: 'section_parentId_fkey',
          columns: ['parentId'],
          references: { schema: 'public', table: 'section', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
