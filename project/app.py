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


if __name__ == "__main__":
    app.run(debug=True, port=5000)
