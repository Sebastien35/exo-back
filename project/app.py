from flask import Flask, render_template, request, redirect, url_for, flash, session
import requests
import os

app = Flask(__name__)
app.secret_key = "your-secret-key"  # Change this to a secure secret key
API_URL = "http://localhost:3000"
ADMIN_PREFIX = "/admin"  # Prefix for all admin routes
CUSTOMER_PREFIX = "/customers   "  # Prefix for all customer routes


@app.route("/")
def index():
    return redirect(url_for("admin_login"))


@app.route(f"{ADMIN_PREFIX}/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        try:
            response = requests.post(
                f"{API_URL}/auth/login", json={"email": email, "password": password}
            )
            print(
                "Response from API: ", response.json()
            )  # Log the response for debugging
            if response.ok:
                data = response.json()
                session["token"] = data["access_token"]
                return redirect(
                    url_for("admin_customers")
                )  # Redirect to admin customers
            else:
                flash("Invalid credentials")
        except requests.RequestException:
            flash("Failed to connect to the server")

    return render_template("login.html")


@app.route(f"{ADMIN_PREFIX}/customers")
def admin_customers():
    if "token" not in session:
        return redirect(url_for("admin_login"))

    headers = {"Authorization": f'Bearer {session["token"]}'}
    try:
        response = requests.get(f"{API_URL}/customers", headers=headers)
        customer_list = response.json() if response.ok else []
    except requests.RequestException:
        flash("Failed to fetch customers")
        customer_list = []

    return render_template("customers.html", customers=customer_list)


@app.route(f"{ADMIN_PREFIX}/customers/create", methods=["POST"])
def admin_create_customer():
    if "token" not in session:
        return redirect(url_for("admin_login"))

    print("Form data received: ", request.form)

    data = request.form.to_dict()
    data["passwordHash"] = data.pop("password")  # Move password to passwordHash

    headers = {
        "Authorization": f"Bearer {session['token']}",
        "Content-Type": "application/json",
    }

    try:
        print("Sending data to NestJS API: ", data)
        response = requests.post(f"{API_URL}/customers", json=data, headers=headers)
        print(response.json())
        if not response.ok:
            flash(response.json().get("message", "Failed to create customer"))
        else:
            flash("Customer created successfully!")
    except requests.RequestException:
        flash("Failed to connect to the server")

    return redirect(url_for("admin_customers"))


@app.route(f"{ADMIN_PREFIX}/customers/<string:customer_id>/delete", methods=["POST"])
def admin_delete_customer(customer_id):
    if "token" not in session:
        return redirect(url_for("admin_login"))

    headers = {"Authorization": f'Bearer {session["token"]}'}
    try:
        response = requests.delete(
            f"{API_URL}/customers/{customer_id}", headers=headers
        )
        if response.ok:
            flash("Customer deleted successfully!")
        else:
            flash("Failed to delete customer")
    except requests.RequestException:
        flash("Failed to connect to the server")

    return redirect(url_for("admin_customers"))


@app.route(f"/logout")
def admin_logout():
    session.clear()
    return redirect(url_for("admin_login"))

@app.route("/customers/<string:customer_id>/consultations", methods=["GET"])
def customer_consultations(customer_id):
    if "token" not in session:
        return redirect(url_for("login"))

    headers = {"Authorization": f'Bearer {session["token"]}'}

    try:
        response = requests.get(
            f"{API_URL}/consultations", headers=headers
        )
        all_consultations = response.json() if response.ok else []
        consultations = [
            c for c in all_consultations if c.get("customerId") == customer_id
        ]
    except requests.RequestException:
        flash("Failed to fetch consultations")
        consultations = []

    return render_template(
        "consultations.html",
        consultations=consultations,
        customer_id=customer_id
    )


@app.route(f"{CUSTOMER_PREFIX}/login", methods=["GET", "POST"])
def customer_login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        tenant_id = request.form.get("tenant")

        user = authenticate_customer(email, password, tenant_id)
        if user:
            session["user"] = user
            session["tenant_id"] = tenant_id
            return redirect(url_for("user_dashboard"))
        else:
            flash("Invalid email or password")
            return redirect(url_for("customer_login"))

    tenants = get_all_tenants()
    return render_template("customer_login.html", tenants=tenants)


@app.route(f"{CUSTOMER_PREFIX}/dashboard")
def customer_dashboard():
    if "user" not in session:
        return redirect(url_for("customer_login"))

    # Add your dashboard logic here
    return render_template("customer_dashboard.html")



@app.route(f"{ADMIN_PREFIX}/dashboard")
def admin_dashboard():
    # Add your dashboard logic here
    return render_template("dashboard.html")


def get_all_tenants():
    try:
        response = requests.get(f"{API_URL}/tenants")
        if response.ok:
            print(response.json())
            return response.json()
        else:
            print(response.json())
            return []
    except requests.RequestException as e:
        print(f"Error fetching tenants: {e}")
        return []


def authenticate_customer(email, password, tenant_id):
    try:
        payload = {"email": email, "password": password, "tenantId": tenant_id}

        response = requests.post(f"{API_URL}/customers/login", json=payload)
        print(response.json())

        if response.status_code == 200:
            data = response.json()
            print("Login successful:", data)
            return data
        else:
            print("Login failed:", response.status_code, response.text)
            return None

    except requests.RequestException as e:
        print("Error during authentication:", e)
        return None


if __name__ == "__main__":
    app.run(debug=True, port=5000)
