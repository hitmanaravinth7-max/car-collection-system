package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.local.AppDatabase
import com.example.data.repository.AuthRepository
import com.example.data.repository.CarRepository
import com.example.ui.components.CarCollectionNavBar
import com.example.ui.components.CarCollectionTopBar
import com.example.ui.components.ConfirmDeleteDialog
import com.example.ui.navigation.Screen
import com.example.ui.screens.AboutScreen
import com.example.ui.screens.AddEditCarScreen
import com.example.ui.screens.CarDetailScreen
import com.example.ui.screens.CarListScreen
import com.example.ui.screens.ContactScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.GalleryScreen
import com.example.ui.screens.LoginScreen
import com.example.ui.screens.NotFoundScreen
import com.example.ui.screens.RegisterScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.CarViewModel
import kotlinx.coroutines.flow.collectLatest

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val database = AppDatabase.getDatabase(applicationContext)
        val carRepository = CarRepository(database.carDao())
        val authRepository = AuthRepository()

        setContent {
            val carViewModel: CarViewModel = viewModel {
                CarViewModel(carRepository, authRepository)
            }

            MyApplicationTheme(darkTheme = true) {
                CarCollectionApp(carViewModel)
            }
        }
    }
}

@Composable
fun CarCollectionApp(viewModel: CarViewModel) {
    val currentScreen by viewModel.currentScreen.collectAsState()
    val carToDelete by viewModel.carToDelete.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    // Collect snackbar events
    LaunchedEffect(viewModel) {
        viewModel.snackbarMessage.collectLatest { message ->
            snackbarHostState.showSnackbar(message)
        }
    }

    // Hardware/System back button handling
    BackHandler(enabled = currentScreen != Screen.Dashboard && currentScreen != Screen.Login) {
        if (!viewModel.navigateBack()) {
            viewModel.navigateTo(Screen.Dashboard)
        }
    }

    val isAuthScreen = currentScreen is Screen.Login || currentScreen is Screen.Register

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            if (!isAuthScreen) {
                CarCollectionTopBar(viewModel = viewModel)
            }
        },
        bottomBar = {
            if (!isAuthScreen) {
                CarCollectionNavBar(viewModel = viewModel)
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (val screen = currentScreen) {
                is Screen.Login -> LoginScreen(viewModel = viewModel)
                is Screen.Register -> RegisterScreen(viewModel = viewModel)
                is Screen.Dashboard -> DashboardScreen(viewModel = viewModel)
                is Screen.ViewAllCars -> CarListScreen(viewModel = viewModel)
                is Screen.AddCar -> AddEditCarScreen(carId = null, viewModel = viewModel)
                is Screen.EditCar -> AddEditCarScreen(carId = screen.carId, viewModel = viewModel)
                is Screen.CarDetails -> CarDetailScreen(carId = screen.carId, viewModel = viewModel)
                is Screen.Gallery -> GalleryScreen(viewModel = viewModel)
                is Screen.About -> AboutScreen(viewModel = viewModel)
                is Screen.Contact -> ContactScreen(viewModel = viewModel)
                is Screen.NotFound -> NotFoundScreen(viewModel = viewModel)
            }
        }
    }

    // Modal Confirmation Dialog when deleting a vehicle
    if (carToDelete != null) {
        ConfirmDeleteDialog(
            car = carToDelete,
            onConfirm = {
                carToDelete?.let { viewModel.deleteCar(it.id) }
            },
            onDismiss = {
                viewModel.carToDelete.value = null
            }
        )
    }
}
