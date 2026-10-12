package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.navigation.Screen
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.NavyBorder
import com.example.ui.theme.NavyDark
import com.example.ui.theme.NavySurface
import com.example.ui.theme.Slate400
import com.example.ui.viewmodel.CarViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CarCollectionTopBar(
    viewModel: CarViewModel,
    modifier: Modifier = Modifier
) {
    val currentScreen by viewModel.currentScreen.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()
    var showMenu by remember { mutableStateOf(false) }

    val canGoBack = currentScreen is Screen.CarDetails ||
            currentScreen is Screen.EditCar ||
            currentScreen is Screen.AddCar ||
            currentScreen is Screen.NotFound

    TopAppBar(
        modifier = modifier.testTag("app_top_bar"),
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = NavyDark,
            titleContentColor = MaterialTheme.colorScheme.onSurface,
            navigationIconContentColor = MaterialTheme.colorScheme.onSurface,
            actionIconContentColor = MaterialTheme.colorScheme.onSurface
        ),
        navigationIcon = {
            if (canGoBack) {
                IconButton(
                    onClick = { viewModel.navigateBack() },
                    modifier = Modifier.testTag("top_back_btn")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back"
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .padding(start = 12.dp)
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(ElectricBlue),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.DirectionsCar,
                        contentDescription = "Logo",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
        },
        title = {
            Column(modifier = Modifier.padding(start = 4.dp)) {
                Text(
                    text = "CAR COLLECTION",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = currentScreen.title,
                    style = MaterialTheme.typography.bodySmall,
                    color = ElectricBlue,
                    fontWeight = FontWeight.SemiBold
                )
            }
        },
        actions = {
            // Quick Add Button (visible when not on AddCar screen)
            if (currentScreen != Screen.AddCar && currentUser != null) {
                FilledTonalButton(
                    onClick = { viewModel.navigateTo(Screen.AddCar) },
                    modifier = Modifier.testTag("quick_add_car_btn"),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Add Car", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                }
            }

            // User Profile or Login Trigger
            IconButton(
                onClick = { showMenu = true },
                modifier = Modifier.testTag("user_menu_btn")
            ) {
                if (currentUser != null) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .background(ElectricBlue.copy(alpha = 0.2f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = currentUser?.name?.take(1)?.uppercase() ?: "U",
                            fontWeight = FontWeight.Bold,
                            color = ElectricBlue,
                            style = MaterialTheme.typography.labelMedium
                        )
                    }
                } else {
                    Icon(imageVector = Icons.Default.Person, contentDescription = "Account")
                }
            }

            DropdownMenu(
                expanded = showMenu,
                onDismissRequest = { showMenu = false },
                modifier = Modifier.background(NavySurface)
            ) {
                if (currentUser != null) {
                    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                        Text(
                            text = currentUser?.name ?: "User",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = currentUser?.email ?: "",
                            style = MaterialTheme.typography.bodySmall,
                            color = Slate400
                        )
                        Text(
                            text = currentUser?.role ?: "",
                            style = MaterialTheme.typography.labelSmall,
                            color = ElectricBlue
                        )
                    }
                    androidx.compose.material3.HorizontalDivider(color = NavyBorder)
                    DropdownMenuItem(
                        text = { Text("Reset Sample Fleet", color = MaterialTheme.colorScheme.onSurface) },
                        onClick = {
                            viewModel.resetDemoData()
                            showMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("About Showroom", color = MaterialTheme.colorScheme.onSurface) },
                        onClick = {
                            viewModel.navigateTo(Screen.About)
                            showMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Contact Desk", color = MaterialTheme.colorScheme.onSurface) },
                        onClick = {
                            viewModel.navigateTo(Screen.Contact)
                            showMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Sign Out", color = MaterialTheme.colorScheme.error) },
                        leadingIcon = {
                            Icon(Icons.Default.ExitToApp, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                        },
                        onClick = {
                            viewModel.logout()
                            showMenu = false
                        }
                    )
                } else {
                    DropdownMenuItem(
                        text = { Text("Sign In", color = MaterialTheme.colorScheme.onSurface) },
                        onClick = {
                            viewModel.navigateTo(Screen.Login)
                            showMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Register", color = MaterialTheme.colorScheme.onSurface) },
                        onClick = {
                            viewModel.navigateTo(Screen.Register)
                            showMenu = false
                        }
                    )
                }
            }
        }
    )
}
