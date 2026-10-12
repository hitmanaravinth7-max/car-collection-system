package com.example.ui.navigation

sealed class Screen(val title: String) {
    data object Login : Screen("Login")
    data object Register : Screen("Register")
    data object Dashboard : Screen("Dashboard")
    data object ViewAllCars : Screen("All Cars")
    data object AddCar : Screen("Add New Car")
    data class EditCar(val carId: String) : Screen("Edit Car")
    data class CarDetails(val carId: String) : Screen("Car Details")
    data object Gallery : Screen("Collection Gallery")
    data object About : Screen("About Us")
    data object Contact : Screen("Contact Showroom")
    data object NotFound : Screen("Page Not Found")
}

enum class NavigationTab(val label: String) {
    DASHBOARD("Dashboard"),
    CARS("Inventory"),
    GALLERY("Gallery"),
    ABOUT("About"),
    CONTACT("Contact")
}
