import {
  AfterInsertTrigger,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ForeignKeyColumn,
  Generated,
  PrimaryGeneratedColumn,
  Table,
  Timestamp,
  UpdateDateColumn,
} from '@immich/sql-tools';
import { CreateIdColumn, UpdatedAtTrigger, UpdateIdColumn } from 'src/decorators';
import { library_after_insert } from 'src/schema/functions';
import { SharedSpaceTable } from 'src/schema/tables/shared-space.table';
import { UserTable } from 'src/schema/tables/user.table';

@Table('library')
@UpdatedAtTrigger('library_updatedAt')
// Populate library_user for the owner on library creation. See
// specs/2026-04-11-library-user-access-backfill-design.md.
@AfterInsertTrigger({
  name: 'library_after_insert',
  scope: 'statement',
  referencingNewTableAs: 'inserted_rows',
  function: library_after_insert,
})
export class LibraryTable {
  @PrimaryGeneratedColumn()
  id!: Generated<string>;

  @Column()
  name!: string;

  @ForeignKeyColumn(() => UserTable, { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: false })
  ownerId!: string;

  // Non-null for the isolated library owned by a Space. Such libraries are excluded from personal
  // library listings and are deleted with their Space; their external source files are untouched.
  @ForeignKeyColumn(() => SharedSpaceTable, { onDelete: 'CASCADE', nullable: true })
  spaceId!: string | null;

  @Column({ type: 'text', array: true })
  importPaths!: string[];

  @Column({ type: 'text', array: true })
  exclusionPatterns!: string[];

  @CreateDateColumn()
  createdAt!: Generated<Timestamp>;

  @UpdateDateColumn()
  updatedAt!: Generated<Date>;

  @DeleteDateColumn()
  deletedAt!: Timestamp | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  refreshedAt!: Timestamp | null;

  @CreateIdColumn({ index: true })
  createId!: Generated<string>;

  @UpdateIdColumn({ index: true })
  updateId!: Generated<string>;
}
