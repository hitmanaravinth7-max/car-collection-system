package com.example.data.repository

import com.example.data.model.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AuthRepository {

    private val _currentUser = MutableStateFlow<User?>(
        User(
            email = "admin@carcollection.com",
            name = "Alexander Vance",
            role = "Collection Director",
            isAuthenticated = true
        )
    )
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    private val registeredUsers = mutableMapOf(
        "admin@carcollection.com" to Pair("password123", "Alexander Vance"),
        "demo@carcollection.com" to Pair("demo123", "Sarah Connor")
    )

    fun login(email: String, password: String):Result<User> {
        val cleanEmail = email.trim().lowercase()
        if (cleanEmail.isEmpty()) {
            return Result.failure(IllegalArgumentException("Email address cannot be empty"))
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(cleanEmail).matches()) {
            return Result.failure(IllegalArgumentException("Please enter a valid email address"))
        }
        if (password.length < 6) {
            return Result.failure(IllegalArgumentException("Password must be at least 6 characters"))
        }

        val stored = registeredUsers[cleanEmail]
        return if (stored != null && stored.first == password) {
            val user = User(
                email = cleanEmail,
                name = stored.second,
                role = if (cleanEmail.contains("admin")) "Collection Director" else "Inventory Specialist",
                isAuthenticated = true
            )
            _currentUser.value = user
            Result.success(user)
        } else if (stored == null) {
            // For convenience in demo mode, if valid format, allow automatic account registration or return clear message
            Result.failure(IllegalArgumentException("User account not found. Please register or use the Demo Admin button."))
        } else {
            Result.failure(IllegalArgumentException("Incorrect password. Please try again."))
        }
    }

    fun register(name: String, email: String, password: String, confirmPassword: String): Result<User> {
        val cleanName = name.trim()
        val cleanEmail = email.trim().lowercase()

        if (cleanName.isEmpty()) {
            return Result.failure(IllegalArgumentException("Full name is required"))
        }
        if (cleanEmail.isEmpty()) {
            return Result.failure(IllegalArgumentException("Email address is required"))
        }
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(cleanEmail).matches()) {
            return Result.failure(IllegalArgumentException("Invalid email format"))
        }
        if (password.length < 6) {
            return Result.failure(IllegalArgumentException("Password must be at least 6 characters"))
        }
        if (password != confirmPassword) {
            return Result.failure(IllegalArgumentException("Passwords do not match"))
        }
        if (registeredUsers.containsKey(cleanEmail)) {
            return Result.failure(IllegalArgumentException("An account with this email already exists"))
        }

        registeredUsers[cleanEmail] = Pair(password, cleanName)
        val user = User(
            email = cleanEmail,
            name = cleanName,
            role = "Inventory Specialist",
            isAuthenticated = true
        )
        _currentUser.value = user
        return Result.success(user)
    }

    fun logout() {
        _currentUser.value = null
    }

    fun loginAsDemoAdmin() {
        val user = User(
            email = "admin@carcollection.com",
            name = "Alexander Vance",
            role = "Collection Director",
            isAuthenticated = true
        )
        _currentUser.value = user
    }
}
