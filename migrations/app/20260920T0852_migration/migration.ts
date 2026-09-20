#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/7a5d5193888ddaba74278cfb213ccec98063e0ce29659401c3991c21e2308b3d/contract';
import endContract from '../../snapshots/7a5d5193888ddaba74278cfb213ccec98063e0ce29659401c3991c21e2308b3d/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/93c513d6f063125a7f13f0f011f05c798081d78c74336967efb44c47a73553f2/contract';
import startContract from '../../snapshots/93c513d6f063125a7f13f0f011f05c798081d78c74336967efb44c47a73553f2/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'problem',
        constraint: 'problem_leetcodeSlug_key',
      }),
      this.addUnique({
        schema: 'public',
        table: 'problem',
        constraint: 'problem_sectionId_leetcodeSlug_key',
        columns: ['sectionId', 'leetcodeSlug'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'problem',
        index: 'problem_leetcodeSlug_idx_e7c07694',
        columns: ['leetcodeSlug'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
