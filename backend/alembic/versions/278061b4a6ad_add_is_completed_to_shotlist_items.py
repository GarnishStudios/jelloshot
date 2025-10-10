"""add_is_completed_to_shotlist_items

Revision ID: 278061b4a6ad
Revises: 29903c28948d
Create Date: 2025-09-25 13:30:07.375124

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '278061b4a6ad'
down_revision: Union[str, None] = '29903c28948d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_completed column to shotlist_items table
    op.add_column('shotlist_items', sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove is_completed column from shotlist_items table
    op.drop_column('shotlist_items', 'is_completed')
