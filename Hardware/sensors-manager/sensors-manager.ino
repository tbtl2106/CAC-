#include <stdio.h>
#include <Wire.h>  

// accelerometer reading variables
const int MPU_addr=0x68;  // I2C address of the MPU-6050
int16_t AcX,AcY,AcZ,GyX,GyY,GyZ;
float Tmp;

const int sm_pin = A1;  /* Soil moisture sensor O/P pin */
const int rd_pin = A0;  /* RAIN DROP sensor O/P pin */
const int rdsensorMin = 0;     // sensor minimum
const int rdsensorMax = 1023;  // sensor maximum


void setup() {
  Wire.begin();
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  Serial.begin(9600); /* Define baud rate for serial communication */
}

void loop() {
  float moisture_percentage;
  float rain_percentage;
  int SMsensor_analog;
  int RDsensor_analog;

  SMsensor_analog = analogRead(sm_pin);
  RDsensor_analog = analogRead(rd_pin);
  moisture_percentage = 100 - ( (SMsensor_analog/1023.00) * 100 ) ;
  rain_percentage = 100 - (RDsensor_analog/1023.00) * 100 ;
  char rps[6], mps[6] ,AcXs[6] ,AcYs[6] ,AcZs[6] ,Tmps[6] ,GyXs[6] ,GyYs[6] ,GyZs[6];;
  dtostrf(rain_percentage, 5, 2, rps);
  dtostrf(moisture_percentage, 4, 2, mps);
  char post[100];
  char post_[30];
  sprintf(post_,"rain=%s&moisture=%s",rps,mps);

  Wire.beginTransmission(MPU_addr);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr,14,true);
  AcX=Wire.read()<<8|Wire.read();
  AcY=Wire.read()<<8|Wire.read();
  AcZ=Wire.read()<<8|Wire.read();
  Tmp=Wire.read()<<8|Wire.read();
  GyX=Wire.read()<<8|Wire.read();
  GyY=Wire.read()<<8|Wire.read();
  GyZ=Wire.read()<<8|Wire.read();

  Tmp = Tmp/340.00+36.53;
  dtostrf(AcX, 5, 0, AcXs);
  dtostrf(AcY, 5, 0, AcYs);
  dtostrf(AcZ, 7, 2, AcZs);
  dtostrf(Tmp, 6, 2, Tmps);
  dtostrf(GyX, 5, 0, GyXs);
  dtostrf(GyY, 5, 0, GyYs);
  dtostrf(GyZ, 5, 0, GyZs);

  sprintf(post,"rain=%s&moisture=%s&AcX=%d&AcY=%d&AcZ=%d&Tmp=%s&GyX=%s&GyY=%s&GyZ=%s", rps, mps, AcX, AcY, AcZ, Tmps, GyXs, GyYs, GyZs);
  // sprintf(post,"%s&AcX=%d&AcY=%d&AcZ=%d&Tmp=%s&GyX=%d&GyY=%d&GyZ=%d", post_, AcX, AcY, AcZ, Tmps, GyX, GyY, GyZ);
  // sprintf(post , "%s&AcX=%d&AcY=%d&AcZ=%d", post_, AcX, AcY, AcZ);

  Serial.println(post);

  delay(1000);
}
