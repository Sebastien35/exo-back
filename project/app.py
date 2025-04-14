from flask import Flask, render_template, request, redirect, url_for, flash, session
import requests
import os

app = Flask(__name__)
app.secret_key = "your-secret-key"  # Change this to a secure secret key
API_URL = "http://localhost:3000"


@app.route("/")
def index():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
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
                    url_for("customers")
                )  # 👈 redirect to the customers tab
            else:
                flash("Invalid credentials")
        except requests.RequestException:
            flash("Failed to connect to the server")

    return render_template("login.html")


@app.route("/customers")
def customers():
    if "token" not in session:
        return redirect(url_for("login"))

    headers = {"Authorization": f'Bearer {session["token"]}'}
    try:
        response = requests.get(f"{API_URL}/customers", headers=headers)
        customer_list = response.json() if response.ok else []
    except requests.RequestException:
        flash("Failed to fetch customers")
        customer_list = []

    return render_template("customers.html", customers=customer_list)


@app.route("/customers/create", methods=["POST"])
def create_customer():
    if "token" not in session:
        return redirect(url_for("login"))

    # Log to ensure Flask route is being hit
    print("Form data received: ", request.form)

    data = request.form.to_dict()
    data["passwordHash"] = data.pop("password")  # Move password to passwordHash

    headers = {
        "Authorization": f"Bearer {session['token']}",
        "Content-Type": "application/json",
    }

    try:
        print("Sending data to NestJS API: ", data)  # Log data being sent
        response = requests.post(f"{API_URL}/customers", json=data, headers=headers)
        print(response.json())  # Log the response for debugging
        if not response.ok:
            flash(response.json().get("message", "Failed to create customer"))
        else:
            flash("Customer created successfully!")
    except requests.RequestException:
        flash("Failed to connect to the server")

    return redirect(url_for("customers"))


@app.route("/customers/<string:customer_id>/delete", methods=["POST"])
def delete_customer(customer_id):
    if "token" not in session:
        return redirect(url_for("login"))

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

    return redirect(url_for("customers"))


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/customers/login", methods=["GET", "POST"])
def customer_login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        tenant_id = request.form.get("tenant")

        # Authenticate user (check email, password, and tenant)
        # Example of authentication, you need to implement the actual logic
        user = authenticate_customer(email, password, tenant_id)
        if user:
            session["user"] = user
            session["tenant_id"] = tenant_id
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid email or password")
            return redirect(url_for("customer_login"))

    # On GET request, render the login page with the list of tenants
    tenants = get_all_tenants()  # Fetch tenants from DB
    return render_template("customer_login.html", tenants=tenants)


def get_all_tenants():
    # This function fetches all tenants from an external API
    try:
        # Sending GET request to fetch tenant data
        response = requests.get(f"{API_URL}/tenants")
        if response.ok:
            print(response.json())
            return response.json()  # Return the data as JSON
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

        if response.status_code == 200:
            data = response.json()
            print("Login successful:", data)
            return data  # This will contain the token and message
        else:
            print("Login failed:", response.status_code, response.text)
            return None

    except requests.RequestException as e:
        print("Error during authentication:", e)
        return None


if __name__ == "__main__":
    app.run(debug=True, port=5000)
