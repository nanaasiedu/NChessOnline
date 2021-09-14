# NChess Online Backend

## Setup

To work on the backend, ensure you use the python virtual environment included in the repo

``
source backend/venv/bin/activate  # Activates virtual environment
(venv) deactivate                 # Deactivates virtual environment
``

## Local

``
python manage.py runserver # start server locally on port 8000

curl -XPOST -H "Content-Type: application/json" -d '{"name":"match 1"}' localhost:8000/match/ # Post new match to backend server
curl -H "Content-Type: application/json" localhost:8000/match/                                # List Matches from backend server
``

## Testing

``
python manage.py test match
``

## Migrations

``
python manage.py makemigrations match # Make migrations for the match app
python manage.py sqlmigrate match     # Shows the SQL that will be run when you migrate
python manage.py migrate              # Run migrations

python manage.py shell                # Opens python console with your django project loaded
``

# Scripts

The scripts in `proj/scripts` should be run with the django shell

``
proj/manage.py < proj/scripts/wipe_database.py
``