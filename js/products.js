/* ===== EDIT HERE =====
 b = RAM price (EGP) – verify against RAM's site and update.
 Final price = b + MARKUP for items priced >= 100, otherwise b (resistors = 1 EGP).
 img = photo path (put photos in images/ folder). Fallback icon shows if missing. */
const WA="201503622260", MARKUP=12;
const price=p=>p.f??(p.b>=100?p.b+MARKUP:p.b);
const C=["Arduino & Modules","Resistors","Capacitors","Transistors","Diodes","LEDs","ICs","Breadboards","Jumper Wires","Sensors","Motors & Drivers","Power & Batteries","Tools & Misc"];
const P=[
["Arduino Uno R3","ATmega328P • 5V • 16MHz",C[0],350,1,"uno"],
["mti avr kit","ATmega328P • 25V • 64MHz",C[0],50,1,"hh"],
["Arduino Nano","ATmega328P • Mini USB",C[0],250,0,"nano"],
["Arduino Mega 2560","ATmega2560 • 54 I/O",C[0],973,0,"mega"],
["ESP32-DEVKITC Development Board (ESP32-WROOM-32D – 16MB Flash)","WiFi + Bluetooth • 30 pin",C[0],280,0,"esp32"],
["Resistor","1/4W • 1Ω – 1MΩ (select value)",C[1],1,0,"resistor",1,"res"],
["Potentiometer","Rotary • select value",C[1],10,0,"pot",0,"potv"],
["Trimmer 10K","Multi-turn 3296",C[1],4,0,"trimmer"],
["LDR Photoresistor","5mm GL5528",C[1],10,0,"ldr"],
["Capacitor (Electrolytic)","Select value & voltage",C[2],3-17,0,"elec",0,"cap"],
["Ceramic Capacitor","Select value (pF–uF)",C[2],1,0,"ceramic",0,"cer"],
["Capacitor 470µF","25V electrolytic",C[2],9,1,"elec"],
["2N2222 Transistor","NPN • 40V • 600mA",C[3],3,1,"2n2222"],
["BC547 Transistor","NPN • 45V • 100mA",C[3],3,0,"bc547"],
["BC557 Transistor","PNP • 45V • 100mA",C[3],3,0,"bc557"],
["TIP122 Darlington","NPN • 100V • 5A",C[3],17,0,"tip122"],
["IRFZ44N MOSFET","N-ch • 55V • 49A",C[3],21,0,"irfz44"],
["1N4148 Diode","Switching • 75V • 150mA",C[4],2,1,"1n4148"],
["1N4007 Diode","Rectifier • 1000V • 1A",C[4],2,0,"1n4007"],
["Zener Diode","Select voltage 3.3–12V",C[4],2,0,"zener",0,"zen"],
["Schottky 1N5819","40V • 1A",C[4],3,0,"1n5819"],
["LED 5mm","Select color • 2V • 20mA",C[5],2,1,"led",0,"col"],
["LED 3mm","Select color",C[5],2,0,"led3",0,"col"],
["RGB LED","Common cathode • 5mm",C[5],5,0,"rgb"],
["7-Segment Display size 0.8","1 digit • common cathode",C[5],12,0,"7seg"],
["7-Segment Display size 0.8","1 digit • common anode",C[5],12,0,"7seg"],
["7-Segment Display size 1.0","1 digit • common cathode",C[5],21,0,"7seg"],
["7-Segment Display size 1.0","1 digit • common anode",C[5],18,0,"7seg"],

["IC 7432 - Quad 2 Input OR Gate (Copy)","DIP-14 • logic gate",C[6],12,0,"or"],
["IC 7408 - Quad 2 Input AND Gates (Copy)","DIP-14 • logic gate",C[6],12,0,"or"],
["IC 7400 - Quad 2 Input NAND Gates (Copy)","DIP-14 • logic gate",C[6],12,0,"or"],
["IC 7404 - NOT Logic Inverter (Copy)","DIP-14 • hex inverter",C[6],12,0,"or"],

["IC 7408 - Quad 2 Input AND Gates (Original)","DIP-14 • logic gate",C[6],18,0,"or"],
["IC 7420 - 4 Input NAND Gate (Original)","DIP-14 • dual 4-input",C[6],28,0,"or"],
["IC 4072 - Dual 4 Input OR Gate (Original)","DIP-14 • CMOS",C[6],35,0,"or"],
["IC 7400 - Quad 2 Input NAND Gates (Original)","DIP-14 • logic gate",C[6],20,0,"or"],
["IC 4071 - Quad 2 Input OR Gate","DIP-14 • CMOS",C[6],25,0,"or"],
["IC 74153 - Dual 4 to 1 Line Multiplexer (Original)","DIP-16",C[6],30,0,"or"],



["NE555 Timer","DIP-8 timer IC",C[6],6,0,"555"],
["LM358 Op-Amp","Dual • DIP-8",C[6],7,0,"lm358"],
["LM7805 Regulator","5V • 1A • TO-220",C[6],7,0,"7805"],
["L293D Motor Driver","Dual H-bridge • DIP-16",C[6],27,0,"l293d"],
["Breadboard 830 Points","Standard size • 830 holes",C[7],55,1,"bb830"],
["Breadboard 400 Points","Mini • 400 holes",C[7],40,0,"bb400"],
["PCB 15x9 cm² Dots Lines Connected","SKU#PCB2II.LINES • 15x9 cm • connected lines",C[7],25,0,"pcb-lines"],
["PCB 15x9 cm² Dots Holes - Each Point","SKU#PCB2.HOLES • 15x9 cm • individual holes",C[7],25,0,"pcb-holes"],
["Jumper Wires (Male-Male)","20cm • 40pcs",C[8],40,1,"mm"],
["Jumper Wires (Male-Female)","20cm • 40pcs",C[8],40,0,"mf"],
["Jumper Wires (Female-Female)","20cm • 40pcs",C[8],40,0,"ff"],
["BB-J140 Connecting jumper wires for Breadboard","140pcs",C[8],65,0,"BB"],
["DHT11 Sensor","Temperature & humidity",C[9],55,0,"dht11"],
["HC-SR04 Ultrasonic","Distance 2–400cm",C[9],50,0,"hcsr04"],
["PIR Motion Sensor","HC-SR501",C[9],55,0,"pir"],
["MQ-2 Gas Sensor","Smoke / LPG",C[9],80,0,"mq2"],
["Servo SG90","9g micro servo",C[10],90,0,"sg90"],

["Stepper 28BYJ-48 + ULN2003","5V stepper kit",C[10],105,0,"stepper"],
["Buzzer 5V","Active",C[10],10,0,"buzzer"],
["attery Holder B4xAA","With switch & wires",C[11],30,0,"holder"],
["Battery Holder 4xAA","With switch & wires",C[11],30,0,"holder"],
["Battery Holder 3x18650","3 cells • with wires",C[11],20,0,"holder3"],
["Battery Holder 2x18650","2 cells • with wires",C[11],15,0,"holder2"],
["9V Battery Clip","With DC jack",C[11],10,0,"clip"],
["DC Wire Female 2.1mm","Standard plug • 25cm",C[11],10,0,"female0"],
["DC Wire Male 2.1mm","Standard plug • 25cm",C[11],10,0,"male0"],
["Battery Rechargeable 1.2V AA","Ni-MH • 2500mAh",C[11],120,0,"Battry1"],
["Delipow Battery 9V","Lithium Ion • 800mAh rechargeable",C[11],440,0,"Battry2"],
["DMP Battery 9V","Ni-MH • 200mAh rechargeable",C[11],275,0,"Battry3"],

["LM2596 Buck Converter","Step-down adjustable 3A",C[11],55,0,"lm2596"],
["TP4056 Charger","Li-ion USB-C module",C[11],25,0,"tp4056"],
["Push Button","6x6mm tactile",C[12],1,0,"btn"],
["Soldering Iron 60W","Adjustable temp",C[12],250,0,"iron"],

["Solder Wire","0.8mm • 15 EGP per meter",C[12],15,0,"solder",0,"meters"],

].map(a=>({n:a[0],s:a[1],c:a[2],b:a[3],pop:a[4],img:"images/"+a[5]+".jpg",inp:a[6],sel:a[7]}));
const O={res:["1Ω","10Ω","100Ω","220Ω","330Ω","470Ω","1K","2.2K","4.7K","10K","47K","100K","1M"],
potv:["500Ω","1kΩ","5kΩ","10kΩ","20kΩ","50kΩ","100kΩ","470kΩ","1MΩ"],
cap:["10µF 16V","47µF 16V","100µF 25V","220µF 25V","470µF 25V","1000µF 25V"],
cer:["10pF","22pF","100pF","104 (100nF)","1nF"],
zen:["3.3V","5.1V","6.2V","9.1V","12V"],col:["Red","Green","Yellow","Blue","White","Orange"],
meters:["1","2","3","4","5","6","7","8","9","10"],};
        