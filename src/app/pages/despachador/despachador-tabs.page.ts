// src/app/pages/despachador/despachador-tabs.page.ts
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-despachador-tabs',
  templateUrl: './despachador-tabs.page.html',
  styleUrls: ['./despachador-tabs.page.scss'],
  imports: [IonicModule, RouterModule, CommonModule]
})
export class DespachadorTabsPage {}