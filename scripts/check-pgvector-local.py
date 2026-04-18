import psycopg2
import sys

db_url = 'postgresql://postgres:123456v*@localhost:5432/viet_sneaker'
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute('SELECT version();')
    ver = cur.fetchone()[0]
    print('Database connected OK!')
    print('PostgreSQL version:', ver)

    # Check pgvector
    cur.execute("SELECT 1 FROM pg_extension WHERE extname = 'vector';")
    result = cur.fetchone()
    if result:
        print('pgvector: INSTALLED')
    else:
        print('pgvector: NOT INSTALLED')

    cur.close()
    conn.close()
except Exception as e:
    print(f'ERROR: {e}')
    sys.exit(1)
