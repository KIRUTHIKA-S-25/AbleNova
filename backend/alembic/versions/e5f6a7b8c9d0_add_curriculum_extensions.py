"""add_curriculum_extensions

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-11-14 14:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import app.db.models.base

# revision identifiers, used by Alembic.
revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, Sequence[str], None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # 1. Alter subjects table if exists
    if 'subjects' in existing_tables:
        sub_cols = [c['name'] for c in inspector.get_columns('subjects')]
        with op.batch_alter_table('subjects') as batch_op:
            if 'grade_level_min' not in sub_cols:
                batch_op.add_column(sa.Column('grade_level_min', sa.Integer(), nullable=False, server_default='1'))
            if 'grade_level_max' not in sub_cols:
                batch_op.add_column(sa.Column('grade_level_max', sa.Integer(), nullable=False, server_default='12'))
            if 'is_active' not in sub_cols:
                batch_op.add_column(sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'))
                batch_op.create_index(op.f('ix_subjects_is_active'), ['is_active'], unique=False)
            if 'language' not in sub_cols:
                batch_op.add_column(sa.Column('language', sa.String(length=10), nullable=False, server_default='en'))

    # 2. Alter topics table if exists
    if 'topics' in existing_tables:
        top_cols = [c['name'] for c in inspector.get_columns('topics')]
        with op.batch_alter_table('topics') as batch_op:
            if 'grade_level' not in top_cols:
                batch_op.add_column(sa.Column('grade_level', sa.Integer(), nullable=False, server_default='5'))
            if 'is_active' not in top_cols:
                batch_op.add_column(sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'))
                batch_op.create_index(op.f('ix_topics_is_active'), ['is_active'], unique=False)
            if 'prerequisite_topic_id' not in top_cols:
                batch_op.add_column(sa.Column('prerequisite_topic_id', app.db.models.base.GUID(), nullable=True))
                batch_op.create_foreign_key(
                    'fk_topics_prerequisite_topic_id_topics',
                    'topics',
                    ['prerequisite_topic_id'],
                    ['id'],
                    ondelete='SET NULL',
                )

    # 3. Alter lessons table if exists
    if 'lessons' in existing_tables:
        les_cols = [c['name'] for c in inspector.get_columns('lessons')]
        with op.batch_alter_table('lessons') as batch_op:
            if 'description' not in les_cols:
                batch_op.add_column(sa.Column('description', sa.Text(), nullable=True))
            if 'grade_level' not in les_cols:
                batch_op.add_column(sa.Column('grade_level', sa.Integer(), nullable=False, server_default='5'))
            if 'is_published' not in les_cols:
                batch_op.add_column(sa.Column('is_published', sa.Boolean(), nullable=False, server_default='1'))
                batch_op.create_index(op.f('ix_lessons_is_published'), ['is_published'], unique=False)
            if 'accessibility_metadata' not in les_cols:
                batch_op.add_column(sa.Column('accessibility_metadata', sa.JSON(), nullable=True))
            if 'created_by_teacher_id' not in les_cols:
                batch_op.add_column(sa.Column('created_by_teacher_id', app.db.models.base.GUID(), nullable=True))
                batch_op.create_foreign_key(
                    'fk_lessons_created_by_teacher_id_teachers',
                    'teachers',
                    ['created_by_teacher_id'],
                    ['id'],
                    ondelete='SET NULL',
                )

    # 4. Create learning_objectives table if not exists
    if 'learning_objectives' not in existing_tables:
        op.create_table(
            'learning_objectives',
            sa.Column('id', app.db.models.base.GUID(), nullable=False),
            sa.Column('lesson_id', app.db.models.base.GUID(), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
            sa.Column(
                'created_at',
                sa.DateTime(timezone=True),
                server_default=sa.text('(CURRENT_TIMESTAMP)'),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_learning_objectives_lesson_id'), 'learning_objectives', ['lesson_id'], unique=False)

    # 5. Create lesson_resources table if not exists
    if 'lesson_resources' not in existing_tables:
        op.create_table(
            'lesson_resources',
            sa.Column('id', app.db.models.base.GUID(), nullable=False),
            sa.Column('lesson_id', app.db.models.base.GUID(), nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('resource_type', sa.String(length=50), nullable=False),
            sa.Column('url', sa.String(length=1024), nullable=False),
            sa.Column('file_size_bytes', sa.Integer(), nullable=True),
            sa.Column('format', sa.String(length=50), nullable=True),
            sa.Column('accessibility_description', sa.Text(), nullable=True),
            sa.Column(
                'created_at',
                sa.DateTime(timezone=True),
                server_default=sa.text('(CURRENT_TIMESTAMP)'),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_lesson_resources_lesson_id'), 'lesson_resources', ['lesson_id'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if 'lesson_resources' in existing_tables:
        op.drop_index(op.f('ix_lesson_resources_lesson_id'), table_name='lesson_resources')
        op.drop_table('lesson_resources')

    if 'learning_objectives' in existing_tables:
        op.drop_index(op.f('ix_learning_objectives_lesson_id'), table_name='learning_objectives')
        op.drop_table('learning_objectives')

    if 'lessons' in existing_tables:
        les_cols = [c['name'] for c in inspector.get_columns('lessons')]
        with op.batch_alter_table('lessons') as batch_op:
            if 'created_by_teacher_id' in les_cols:
                batch_op.drop_constraint('fk_lessons_created_by_teacher_id_teachers', type_='foreignkey')
                batch_op.drop_column('created_by_teacher_id')
            if 'accessibility_metadata' in les_cols:
                batch_op.drop_column('accessibility_metadata')
            if 'is_published' in les_cols:
                batch_op.drop_index(op.f('ix_lessons_is_published'))
                batch_op.drop_column('is_published')
            if 'grade_level' in les_cols:
                batch_op.drop_column('grade_level')
            if 'description' in les_cols:
                batch_op.drop_column('description')

    if 'topics' in existing_tables:
        top_cols = [c['name'] for c in inspector.get_columns('topics')]
        with op.batch_alter_table('topics') as batch_op:
            if 'prerequisite_topic_id' in top_cols:
                batch_op.drop_constraint('fk_topics_prerequisite_topic_id_topics', type_='foreignkey')
                batch_op.drop_column('prerequisite_topic_id')
            if 'is_active' in top_cols:
                batch_op.drop_index(op.f('ix_topics_is_active'))
                batch_op.drop_column('is_active')
            if 'grade_level' in top_cols:
                batch_op.drop_column('grade_level')

    if 'subjects' in existing_tables:
        sub_cols = [c['name'] for c in inspector.get_columns('subjects')]
        with op.batch_alter_table('subjects') as batch_op:
            if 'language' in sub_cols:
                batch_op.drop_column('language')
            if 'is_active' in sub_cols:
                batch_op.drop_index(op.f('ix_subjects_is_active'))
                batch_op.drop_column('is_active')
            if 'grade_level_max' in sub_cols:
                batch_op.drop_column('grade_level_max')
            if 'grade_level_min' in sub_cols:
                batch_op.drop_column('grade_level_min')
