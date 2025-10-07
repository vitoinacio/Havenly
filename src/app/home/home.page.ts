import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Property } from '../services/property.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  searchTerm: string = '';
  selectedFilter: string = 'todos';
  showFabActions: boolean = false;

  constructor(private firestore: Firestore, private modalCtrl: ModalController) {}

  ngOnInit() {
    const propertiesRef = collection(this.firestore, 'properties');
    collectionData(propertiesRef, { idField: 'id' }).subscribe((data: any) => {
      this.properties = data;
      this.filterProperties();
    });
  }

  filterProperties() {
    this.filteredProperties = this.properties.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (property.tenant && property.tenant.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesFilter =
        this.selectedFilter === 'todos' ||
        property.status.toLowerCase() === this.selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }



  toggleFabActions() {
    this.showFabActions = !this.showFabActions;
  }

  createProperty() {
    // Navega para a página de criação
    window.location.href = '/add-property';
  }

  deleteProperty() {
    // Aqui você pode abrir um modal para selecionar e excluir
    alert('Função de exclusão ainda será implementada.');
  }
}

