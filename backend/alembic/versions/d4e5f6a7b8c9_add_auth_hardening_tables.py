"""add_auth_hardening_tables

Revision ID: d4e5f6a7b8c9
Revises: 8c12c5387ad5
Create Date: 2026-11-14 13:25:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import app.db.models.base

# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = '8c12c5387ad5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # 1. Create refresh_tokens table if not exists
    if 'refresh_tokens' not in existing_tables:
        op.create_table(
            'refresh_tokens',
            sa.Column('id', app.db.models.base.GUID(), nullable=False),
            sa.Column('user_id', app.db.models.base.GUID(), nullable=False),
            sa.Column('token_hash', sa.String(length=255), nullable=False),
            sa.Column('jti', sa.String(length=255), nullable=False),
            sa.Column('revoked', sa.Boolean(), nullable=False),
            sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_refresh_tokens_user_id'), 'refresh_tokens', ['user_id'], unique=False)
        op.create_index(op.f('ix_refresh_tokens_token_hash'), 'refresh_tokens', ['token_hash'], unique=True)
        op.create_index(op.f('ix_refresh_tokens_jti'), 'refresh_tokens', ['jti'], unique=True)

    # 2. Create failed_login_attempts table if not exists
    if 'failed_login_attempts' not in existing_tables:
        op.create_table(
            'failed_login_attempts',
            sa.Column('id', app.db.models.base.GUID(), nullable=False),
            sa.Column('identifier', sa.String(length=255), nullable=False),
            sa.Column('ip_address', sa.String(length=45), nullable=True),
            sa.Column('attempted_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
            sa.PrimaryKeyConstraint('id'),
        )
        op.create_index(op.f('ix_failed_login_attempts_identifier'), 'failed_login_attempts', ['identifier'], unique=False)
        op.create_index(op.f('ix_failed_login_attempts_attempted_at'), 'failed_login_attempts', ['attempted_at'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if 'failed_login_attempts' in existing_tables:
        op.drop_index(op.f('ix_failed_login_attempts_attempted_at'), table_name='failed_login_attempts')
        op.drop_index(op.f('ix_failed_login_attempts_identifier'), table_name='failed_login_attempts')
        op.drop_table('failed_login_attempts')

    if 'refresh_tokens' in existing_tables:
        op.drop_index(op.f('ix_refresh_tokens_jti'), table_name='refresh_tokens')
        op.drop_index(op.f('ix_refresh_tokens_token_hash'), table_name='refresh_tokens')
        op.drop_index(op.f('ix_refresh_tokens_user_id'), table_name='refresh_tokens')
        op.drop_table('refresh_tokens')
