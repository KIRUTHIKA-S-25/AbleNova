"""Setup database extensions (pgvector and uuid)

Revision ID: 0001_setup_extensions
Revises: 
Create Date: 2026-11-14 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001_setup_extensions"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP EXTENSION IF EXISTS vector CASCADE;")
        op.execute('DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;')
