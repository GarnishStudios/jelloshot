"""Add clients table and client_id to projects

Revision ID: add_clients_client_id
Revises: 9ea7dae889db
Create Date: 2025-11-24 17:24:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_clients_client_id'
down_revision: Union[str, None] = '9ea7dae889db'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create clients table
    op.create_table(
        'clients',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    )
    op.create_index(op.f('ix_clients_user_id'), 'clients', ['user_id'], unique=False)
    
    # Add client_id to projects table
    op.add_column('projects', sa.Column('client_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_projects_client_id', 'projects', 'clients', ['client_id'], ['id'])


def downgrade() -> None:
    # Remove client_id from projects
    op.drop_constraint('fk_projects_client_id', 'projects', type_='foreignkey')
    op.drop_column('projects', 'client_id')
    
    # Drop clients table
    op.drop_index(op.f('ix_clients_user_id'), table_name='clients')
    op.drop_table('clients')

