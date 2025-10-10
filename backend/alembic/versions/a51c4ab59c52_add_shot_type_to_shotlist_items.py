"""add_shot_type_to_shotlist_items

Revision ID: a51c4ab59c52
Revises: 278061b4a6ad
Create Date: 2025-09-25 14:00:33.335520

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a51c4ab59c52'
down_revision: Union[str, None] = '278061b4a6ad'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add shot_type column to shotlist_items table
    op.add_column('shotlist_items', sa.Column('shot_type', sa.String(length=50), nullable=True, server_default='Standard'))


def downgrade() -> None:
    # Remove shot_type column from shotlist_items table
    op.drop_column('shotlist_items', 'shot_type')
