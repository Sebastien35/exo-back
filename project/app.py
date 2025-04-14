from flask import Flask, render_template, request, redirect, url_for, flash, session
import requests
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key'  # Change this to a secure secret key
API_URL = 'http://localhost:3000'

@app.route('/')
def index():
    if 'token' not in session:
        return redirect(url_for('login'))
    
    # Fetch tenants from the API
    headers = {'Authorization': f'Bearer {session["token"]}'}
    response = requests.get(f'{API_URL}/tenants', headers=headers)
    tenants = response.json() if response.ok else []
    
    return render_template('index.html', tenants=tenants)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        try:
            response = requests.post(f'{API_URL}/auth/login', json={
                'email': email,
                'password': password
            })
            
            if response.ok:
                data = response.json()
                session['token'] = data['access_token']
                return redirect(url_for('index'))
            else:
                flash('Invalid credentials')
        except requests.RequestException:
            flash('Failed to connect to the server')
        
    return render_template('login.html')

@app.route('/tenants/create', methods=['GET', 'POST'])
def create_tenant():
    if 'token' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        headers = {
            'Authorization': f'Bearer {session["token"]}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f'{API_URL}/tenants',
            json=request.form.to_dict(),
            headers=headers
        )
        
        if response.ok:
            return redirect(url_for('index'))
        flash('Failed to create tenant')
    
    return render_template('create_tenant.html')

@app.route('/tenants/<string:id>/edit', methods=['GET', 'POST'])
def edit_tenant(id):
    if 'token' not in session:
        return redirect(url_for('login'))
    
    headers = {'Authorization': f'Bearer {session["token"]}'}
    
    if request.method == 'POST':
        response = requests.put(
            f'{API_URL}/tenants/{id}',
            json=request.form.to_dict(),
            headers=headers
        )
        
        if response.ok:
            return redirect(url_for('index'))
        flash('Failed to update tenant')
    
    # Get current tenant data
    response = requests.get(f'{API_URL}/tenants/{id}', headers=headers)
    tenant = response.json() if response.ok else None
    
    return render_template('edit_tenant.html', tenant=tenant)

@app.route('/tenants/<string:id>/delete', methods=['POST'])
def delete_tenant(id):
    if 'token' not in session:
        return redirect(url_for('login'))
    
    headers = {'Authorization': f'Bearer {session["token"]}'}
    response = requests.delete(f'{API_URL}/tenants/{id}', headers=headers)
    
    if not response.ok:
        flash('Failed to delete tenant')
    
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)