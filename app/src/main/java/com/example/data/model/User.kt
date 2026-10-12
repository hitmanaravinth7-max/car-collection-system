package com.example.data.model

data class User(
    val email: String,
    val name: String,
    val role: String = "Collection Manager",
    val isAuthenticated: Boolean = true
)
