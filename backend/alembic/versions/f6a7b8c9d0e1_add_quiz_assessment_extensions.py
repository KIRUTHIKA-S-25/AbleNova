"""add_quiz_assessment_extensions

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-11-14 16:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import app.db.models.base

# revision identifiers, used by Alembic.
revision: str = 'f6a7b8c9d0e1'
down_revision: Union[str, Sequence[str], None] = 'e5f6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # 1. Alter quizzes table
    if 'quizzes' in existing_tables:
        quiz_cols = [c['name'] for c in inspector.get_columns('quizzes')]
        with op.batch_alter_table('quizzes') as batch_op:
            if 'is_published' not in quiz_cols:
                batch_op.add_column(sa.Column('is_published', sa.Boolean(), nullable=False, server_default='0'))
                batch_op.create_index(op.f('ix_quizzes_is_published'), ['is_published'], unique=False)
            if 'passing_threshold' not in quiz_cols:
                batch_op.add_column(sa.Column('passing_threshold', sa.Float(), nullable=False, server_default='0.70'))
            if 'max_attempts' not in quiz_cols:
                batch_op.add_column(sa.Column('max_attempts', sa.Integer(), nullable=True))
            if 'topic_id' not in quiz_cols:
                batch_op.add_column(sa.Column('topic_id', app.db.models.base.GUID(), nullable=True))
                batch_op.create_foreign_key(
                    'fk_quizzes_topic_id_topics',
                    'topics',
                    ['topic_id'],
                    ['id'],
                    ondelete='SET NULL'
                )
                batch_op.create_index(op.f('ix_quizzes_topic_id'), ['topic_id'], unique=False)

    # 2. Alter questions table
    if 'questions' in existing_tables:
        q_cols = [c['name'] for c in inspector.get_columns('questions')]
        with op.batch_alter_table('questions') as batch_op:
            if 'marks' not in q_cols:
                batch_op.add_column(sa.Column('marks', sa.Integer(), nullable=False, server_default='1'))

    # 3. Alter quiz_attempts table
    if 'quiz_attempts' in existing_tables:
        qa_cols = [c['name'] for c in inspector.get_columns('quiz_attempts')]
        with op.batch_alter_table('quiz_attempts') as batch_op:
            if 'is_passed' not in qa_cols:
                batch_op.add_column(sa.Column('is_passed', sa.Boolean(), nullable=False, server_default='0'))
            if 'client_submission_id' not in qa_cols:
                batch_op.add_column(sa.Column('client_submission_id', sa.String(length=255), nullable=True))
                batch_op.create_index(op.f('ix_quiz_attempts_client_submission_id'), ['client_submission_id'], unique=False)
            if 'feedback' not in qa_cols:
                batch_op.add_column(sa.Column('feedback', sa.Text(), nullable=True))
            if 'recommendation_id' not in qa_cols:
                batch_op.add_column(sa.Column('recommendation_id', app.db.models.base.GUID(), nullable=True))
                batch_op.create_foreign_key(
                    'fk_quiz_attempts_recommendation_id_recommendations',
                    'recommendations',
                    ['recommendation_id'],
                    ['id'],
                    ondelete='SET NULL'
                )

    # 4. Alter question_attempts table
    if 'question_attempts' in existing_tables:
        item_cols = [c['name'] for c in inspector.get_columns('question_attempts')]
        with op.batch_alter_table('question_attempts') as batch_op:
            if 'marks_obtained' not in item_cols:
                batch_op.add_column(sa.Column('marks_obtained', sa.Float(), nullable=False, server_default='0.0'))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if 'question_attempts' in existing_tables:
        with op.batch_alter_table('question_attempts') as batch_op:
            batch_op.drop_column('marks_obtained')

    if 'quiz_attempts' in existing_tables:
        with op.batch_alter_table('quiz_attempts') as batch_op:
            batch_op.drop_constraint('fk_quiz_attempts_recommendation_id_recommendations', type_='foreignkey')
            batch_op.drop_index(op.f('ix_quiz_attempts_client_submission_id'))
            batch_op.drop_column('recommendation_id')
            batch_op.drop_column('feedback')
            batch_op.drop_column('client_submission_id')
            batch_op.drop_column('is_passed')

    if 'questions' in existing_tables:
        with op.batch_alter_table('questions') as batch_op:
            batch_op.drop_column('marks')

    if 'quizzes' in existing_tables:
        with op.batch_alter_table('quizzes') as batch_op:
            batch_op.drop_constraint('fk_quizzes_topic_id_topics', type_='foreignkey')
            batch_op.drop_index(op.f('ix_quizzes_topic_id'))
            batch_op.drop_index(op.f('ix_quizzes_is_published'))
            batch_op.drop_column('topic_id')
            batch_op.drop_column('max_attempts')
            batch_op.drop_column('passing_threshold')
            batch_op.drop_column('is_published')
