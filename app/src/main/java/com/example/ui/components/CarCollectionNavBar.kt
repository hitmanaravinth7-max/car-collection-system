package com.example.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Collections
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.example.ui.navigation.NavigationTab
import com.example.ui.theme.ElectricBlue
import com.example.ui.theme.NavyBorder
import com.example.ui.theme.NavyDark
import com.example.ui.theme.Slate400
import com.example.ui.viewmodel.CarViewModel

@Composable
fun CarCollectionNavBar(
    viewModel: CarViewModel,
    modifier: Modifier = Modifier
) {
    val currentTab by viewModel.currentTab.collectAsState()

    NavigationBar(
        modifier = modifier.testTag("bottom_nav_bar"),
        containerColor = NavyDark,
        tonalElevation = 8.dp
    ) {
        NavigationTab.entries.forEach { tab ->
            val isSelected = currentTab == tab
            val icon = when (tab) {
                NavigationTab.DASHBOARD -> Icons.Default.Dashboard
                NavigationTab.CARS -> Icons.Default.DirectionsCar
                NavigationTab.GALLERY -> Icons.Default.Collections
                NavigationTab.ABOUT -> Icons.Default.Info
                NavigationTab.CONTACT -> Icons.Default.Mail
            }

            NavigationBarItem(
                selected = isSelected,
                onClick = { viewModel.selectTab(tab) },
                icon = {
                    Icon(
                        imageVector = icon,
                        contentDescription = tab.label
                    )
                },
                label = {
                    Text(
                        text = tab.label,
                        style = MaterialTheme.typography.labelSmall
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.onPrimary,
                    selectedTextColor = ElectricBlue,
                    indicatorColor = ElectricBlue,
                    unselectedIconColor = Slate400,
                    unselectedTextColor = Slate400
                ),
                modifier = Modifier.testTag("nav_tab_${tab.name.lowercase()}")
            )
        }
    }
}
