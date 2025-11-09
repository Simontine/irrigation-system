import { Component, OnInit } from '@angular/core';
import { Database, ref, onValue, set } from '@angular/fire/database';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  username: string | null = '';
  time: string = '';
  private timer: any;
  user: string = 'Clinton';

  maxTankValue = 20;
  tankPercentage: number = 0;
  liters: number = 0;


  label: string = 'Moisture';
  lightLabel: string = 'Light Level';
  weather: string = 'Weather';

  lightValue: number | null = null;
  lightPercentage: number | null = null;
  temperature: number | null = null;
  humidity: number | null = null;
  soilMoisture: number | null = null;
  waterSwitch: boolean = false;
  automate: boolean = false;
  tankLevel: number = 0;

  //////////////////////////////////
  isAuto: boolean = false; 
  auto: string ='OFF'; 
  
  /////////////////////////////////

  constructor(private db: Database, private router: Router) {}

  

  ngOnInit() {


    const loggedIn = localStorage.getItem('isLoggedIn');
    this.username = localStorage.getItem('username');
    

    if (loggedIn !== 'true') {
      this.router.navigate(['/']);
    }
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);


    const dbRef = ref(this.db, 'sensorData');

    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.temperature = data.temperature ?? null;
        this.humidity = data.humidity ?? null;
        this.soilMoisture = data.soilMoisture ?? null;
        this.lightValue = data.lightValue ?? null;
        this.waterSwitch = data.waterSwitch ?? false;
        this.auto = data.auto ?? false;
        this.lightPercentage = data.lightPercentage ?? null;
        this.tankLevel = ((data.tankLevel)) ?? null;
        console.log("Distance: ", ((20.2 - this.tankLevel)/20)*3);
        this.liters = (((this.tankLevel)/20)*3);
        this.tankPercentage = (( this.tankLevel)/20)*100;
        // console.log("Tank Percentage: ", this.tankPercentage);
      }
    });

    
    // this.tankPercentage = this.tankLevel !== null ? (this.tankLevel / this.maxTankValue) * 100 : 0;
    
   
  }
  

  updateTime() {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };

    const datePart = now.toLocaleDateString('en-GB', dateOptions);
    const timePart = now.toLocaleTimeString('en-GB', timeOptions);

    this.time = `${datePart} • ${timePart}`;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  // 🔹 Called when the switch is toggled
  async waterNow() {
    console.log(`Water switch toggled: ${this.waterSwitch}`);

    try {
      const switchRef = ref(this.db, 'sensorData/waterSwitch');
      await set(switchRef, this.waterSwitch);
      console.log('Firebase updated successfully');
    } catch (error) {
      console.error('Error updating Firebase:', error);
    }
  }
  
  
async toggleColor() {
  this.isAuto = !this.isAuto;
  if (this.isAuto) {
    this.auto = 'ON';
    this.automate = true;
  }
  else {
    this.auto = 'OFF';
    this.automate = false;
  }
  
  try {
    const autoRef = ref(this.db, 'sensorData/auto');
    await set(autoRef, this.automate); // Write 'ON' or 'OFF'
    console.log(`Automation state set to: ${this.automate}`);
  } catch (error) {
    console.error('Error updating automation state in Firebase:', error);
  }
}

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
