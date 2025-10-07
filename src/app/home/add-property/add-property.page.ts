import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './add-property.page.html',
  styleUrls: ['./add-property.page.scss'],
})
export class AddPropertyPage {
  photoFile: File | null = null;
  photoUrl: string = '';
  name: string = '';
  tenant: string = '';
  rent: number | null = null;
  dueDate: string = '';
  status: 'Alugado' | 'Vazio' = 'Vazio';
  isUploading: boolean = false;

  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  async onFileSelected(event: any) {
    this.photoFile = event.target.files[0];
  }

  async uploadPhoto(): Promise<string> {
    if (!this.photoFile) return '';
    const filePath = `properties/${Date.now()}_${this.photoFile.name}`;
    const storageRef = ref(this.storage, filePath);
    const snapshot = await uploadBytes(storageRef, this.photoFile);
    return await getDownloadURL(snapshot.ref);
  }

  async saveProperty() {
    if (!this.name || !this.rent || !this.dueDate) {
      this.showToast('Preencha todos os campos obrigatórios.');
      return;
    }

    this.isUploading = true;

    try {
      const photoUrl = await this.uploadPhoto();

      const property = {
        photo: photoUrl || 'assets/img/default.jpg',
        name: this.name,
        tenant: this.tenant,
        rent: this.rent,
        dueDate: this.dueDate,
        status: this.status,
      };

      const propertiesRef = collection(this.firestore, 'properties');
      await addDoc(propertiesRef, property);

      this.showToast('Imóvel criado com sucesso!');
      this.navCtrl.navigateBack('/home');
    } catch (error) {
      console.error(error);
      this.showToast('Erro ao salvar imóvel.');
    } finally {
      this.isUploading = false;
    }
  }

  cancel() {
    this.navCtrl.navigateBack('/home');
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
}