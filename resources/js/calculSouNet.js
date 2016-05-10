/*************** Llegenda **********************/
/*
* SBA: Salari Brut Anual
* SNA: Salari Net Anual
* CI: Contracte Indefinit
* C: Categoria
* SF: Situació Familiar
* MV: Movilitat geográfica
* SS: Seguretat Social
* BIRPF: Base IRPF
* DRT: Rendiment del Treball
* MF: Mínim Familiar
* MP: Mínim Personal
* MC: Mínim Contribuent
* DESC: Descendent
* ASC: Ascendent
* MDESC: Mínim DESC
* MASC: Mínim ASC
* D_CONT_LESS65: Discapacitat contribuent < 65%
* D_CONT_MOV: Discapacitat contribuent movilitat
* D_CONT_MORE65: Discapacitat contribuent > 65%
* nDISCPAL65: Núm Discpacitat Less del 65%
* nDISCPAM65: Núm Discpacitat More del 65%
*/


function calcularSouNet(document) {
    var edat, SBA, CI, C, SF, MOV_GEO, D_CONT, D_CONT_MOV;
    var nFills, nless3,exclusiu,nFills_disc_gen, nFills_disc_More65, nFill_Mov;
    var ASC65,ASC75,LESS65DISC,MDISCPAL65,MDISCPA_MOV,MDISCPAM65;
    var radios;
    //edat_mín
    var min_edat = 18;
    
    edat = document.getElementById('edat').value;
    SBA = document.getElementById('SB').value;
    CI = document.getElementById('CONTRACTEINDEFINIT').checked;
    C = document.getElementById('CAT_PROF').value;
    SF = document.getElementById('SIT_FAM').value;
    MOV_GEO = document.getElementById('MOV_GEO').checked;
    
    radios = document.getElementsByName('discp');
    for (var i=0; i<radios.length; i++){
        if (radios.item(i).checked === true) {
            D_CONT = radios.item(i).value;
        }
    }
    D_CONT_MOV = document.getElementById('MOV_RED').checked;
    
    //Info respecte els fills
    nFills = document.getElementById('DESC').value;
    nless3 = document.getElementById('less3Years').value;
    exclusiu = document.getElementById('EXCLUSIVE').checked;
    nFills_disc_gen = document.getElementById('MDISCPDL65').value;
    nFill_Mov = document.getElementById('MDISCPD_MOV').value;
    nFills_disc_More65 = document.getElementById('MDISCPDM65').value;
     
    //Info respecte ascendents
    ASC65 = document.getElementById('ASC65').value;
    ASC75 = document.getElementById('ASC75').value;
    LESS65DISC = document.getElementById('LESS65DISC').value;
    
    //Info respecte discapacitats ascendents
    MDISCPAL65 = document.getElementById('MDISCPAL65').value;
    MDISCPA_MOV = document.getElementById('MDISCPA_MOV').value;
    MDISCPAM65 = document.getElementById('MDISCPAM65').value;

           
    if(min_edat<18) {
        alert ('La edat mínima para el cálculo es de 18 años');
        return;
    }

    
    var person = G$(edat,SBA,CI,C,SF,MOV_GEO,D_CONT,D_CONT_MOV);
    if (person.setDadesFills(nFills,nless3,exclusiu) < 0) {
        return;
    }
    
    if (person.setDiscDesc(nFills_disc_gen,nFill_Mov,nFills_disc_More65) < 0) {
        return;
    }
    
    person.setNumAsc(ASC65,ASC75,LESS65DISC);
    person.setDiscAsc(MDISCPAL65,MDISCPA_MOV,MDISCPAM65);
    
    
console.log(person.calculSS());
console.log(person.calculBIRPF());
    console.log(person.calcularRet2());
    console.log(person.calculTIRPF());
    console.log(person.calcularMPF());
    
    document.getElementById('iSB').value = Number(person.getSou()).toLocaleString('es') + '€'; 
    document.getElementById('iSN').value = person.souB - person.calcuSS() - person.calculRIRPF;
    document.getElementById('iRN').value = Number(person.calculTIRPF().toFixed(2)).toLocaleString('es') + '%';
    document.getElementById('iSS').value = Number(person.calculSS().toFixed(2)).toLocaleString('es') + '€';
    
    document.getElementById('iBR').value = Number(person.calculBIRPF().toFixed(2)).toLocaleString('es') + '€';
    document.getElementById('iMPF').value = Number(person.calcularMPF().toFixed(2)).toLocaleString('es') + '€';
    document.getElementById('iTRA').value = Number(person.calculTIRPF().toFixed(2)).toLocaleString('es') + '%';
    document.getElementById('iRIC').value = Number(((person.calculTIRPF() * SBA)/100).toFixed(2)).toLocaleString('es') + '€';
    
    

/*
* @Author: Pau Pujol
*/
}

function changeState(document) { 
        var DISC_GEN_CONT = document.getElementById('DISC_GEN_CONT').checked;
        //var MOV_RED = document.getElementById('MOV_RED').checked;
        //var DISC_65_CONT = document.getElementById('DISC_65_CONT').checked;
    if (DISC_GEN_CONT === true) {
        document.getElementById('MOV_RED').disabled = false;
    } else {
        document.getElementById('MOV_RED').disabled = true;
        document.getElementById('MOV_RED').checked = false;
    }
        
}


function changeState_DISC_CONT(document, element) {

    if (element.id === "lDISC_65_CONT") {
       document.getElementById('DISC_65_CONT').checked = true; 
       document.getElementById('NO_DISC').checked = false; 
       document.getElementById('DISC_GEN_CONT').checked = false; 
        document.getElementById('MOV_RED').disabled = true;
        document.getElementById('MOV_RED').checked = false;
    } else if (element.id === "lNO_DISC") {
        document.getElementById('DISC_65_CONT').checked = false; 
       document.getElementById('NO_DISC').checked = true; 
       document.getElementById('DISC_GEN_CONT').checked = false; 
        document.getElementById('MOV_RED').disabled = true;
        document.getElementById('MOV_RED').checked = false;        
    } else {
        document.getElementById('DISC_65_CONT').checked = false; 
       document.getElementById('NO_DISC').checked = false; 
       document.getElementById('DISC_GEN_CONT').checked = true; 
        document.getElementById('MOV_RED').disabled = false;
    }
}




$("#lMOV_RED").click(function(){
   if (document.getElementById('MOV_RED').disabled === false) {
       if (document.getElementById('MOV_RED').checked === true) {
           document.getElementById('MOV_RED').checked = false;
       } else {
           document.getElementById('MOV_RED').checked = true;
       }
   }
});

$("#lCONTRACTEINDEFINIT").click(function(){
   
   if (document.getElementById('CONTRACTEINDEFINIT').checked === true) {
       document.getElementById('CONTRACTEINDEFINIT').checked = false;
   } else {
       document.getElementById('CONTRACTEINDEFINIT').checked = true;
   }
   
});

$("#lMOV_GEO").click(function(){
   
   if (document.getElementById('MOV_GEO').checked === true) {
       document.getElementById('MOV_GEO').checked = false;
   } else {
       document.getElementById('MOV_GEO').checked = true;
   }
   
});

$("#lEXCLUSIVE").click(function(){
   
   if (document.getElementById('EXCLUSIVE').checked === true) {
       document.getElementById('EXCLUSIVE').checked = false;
   } else {
       document.getElementById('EXCLUSIVE').checked = true;
   }
   
});


function changeState_movD(document){
    var nFillDisc = document.getElementById('MDISCPDL65').value;
    if (nFillDisc > 0) {
        document.getElementById('MDISCPD_MOV').disabled = false;
    } else {
        document.getElementById('MDISCPD_MOV').disabled = true;
        document.getElementById('MDISCPD_MOV').value = 0;
    }
}

function changeState_movA(document) {
    var nAscDisc = document.getElementById('MDISCPAL65').value;
    if (nAscDisc > 0) {
        document.getElementById('MDISCPA_MOV').disabled = false;
    } else {
        document.getElementById('MDISCPA_MOV').disabled = true;
        document.getElementById('MDISCPA_MOV').value = 0;
    }
}










    