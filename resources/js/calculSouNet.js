/*************** Llegenda **********************/
/*
* SBA: Salari Brut Anual
* SNA: Salari Net Anual
* SNM: Sou Net Mensual 12 pagues
* SNM14: Sou Net Mensual 14 pagues
* NP: Número de Pagues
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
* Disc_CONT_LESS65: Discapacitat contribuent < 65%
* Disc_CONT_MOV: Discapacitat contribuent movilitat
* Didc_CONT_MORE65: Discapacitat contribuent > 65%
* nDISCPAL65: Núm Discpacitat Less del 65%
* nDISCPAM65: Núm Discpacitat More del 65%
* GD: Gastos Deducibles
*/

$("#Resultats").hide();


function calcularSouNet(document) {
    var edat, SNM14, CI, C, SF, MOV_GEO, Disc_CONT, Disc_CONT_MOV;
    var nFills, nless3,exclusiu,nFills_disc_gen, nFills_disc_More65, nFill_Mov;
    var ASC65,ASC75,LESS65DISC,MDISCPAL65,MDISCPA_MOV,MDISCPAM65;
    var SBA, SNA, SNM, NP, TIRPF, PExtra, GD;
    var radios;
    //edat_mín
    var min_edat = 18;
    
    edat = document.getElementById('edat').value;
    SBA = document.getElementById('SB').value;
    NP = document.getElementById('sNumPagues').value;
    CI = document.getElementById('CONTRACTEINDEFINIT').checked;
    C = document.getElementById('CAT_PROF').value;
    SF = document.getElementById('SIT_FAM').value;
    MOV_GEO = document.getElementById('MOV_GEO').checked;
    
    radios = document.getElementsByName('discp');
    for (var i=0; i<radios.length; i++){
        if (radios.item(i).checked === true) {
            Disc_CONT = radios.item(i).value;
        }
    }
    Disc_CONT_MOV = document.getElementById('MOV_RED').checked;
    
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

    //checks whether is a number or not
    var patt1 = /\D/g;
    
    //Not found any character on the souB
    if (SBA.match(patt1) !== null) {
        alert(" Por favor, introduzca el Salario Bruto Anual - Entero, sin comas ni puntos ni decimales");
        return;
    }
    
    //Sou Brut cannot be 0
    if (SBA <= 0) {
        alert(" Por favor, introduzca un valor correcto como Salario Bruto Anual.");
        return;
    }
           
    if(min_edat<18) {
        alert ('La edat mínima para el cálculo es de 18 años');
        return;
    }
    
    //Si situació 1 com ha mínim ha de tenir un fill
    if ((SF == 1) && (Number(nFills) === 0)) {
         alert ('La situación familiar "1" exige que el contribuyente tenga al menos un descendiente que dé derecho a la reducción de la tributación conjunta para familiasa monoparentales.');
        return;
    }

    //Creem l'objecte person i introduim les dades
    var person = G$(edat,SBA,CI,C,SF,MOV_GEO,Disc_CONT,Disc_CONT_MOV);
    if (person.setDadesFills(nFills,nless3,exclusiu) < 0) {
        return;
    }
    //Introduïm la informació dels fills
    if (person.setDiscDesc(nFills_disc_gen,nFill_Mov,nFills_disc_More65) < 0) {
        return;
    }
    //we enter the dat regarding the Ascendents
    person.setNumAsc(ASC65,ASC75,LESS65DISC);
    //we enter information regarding the discapacitats
    if (person.setDiscAsc(MDISCPAL65,MDISCPA_MOV,MDISCPAM65) < 0) {
        return;
    }
    
    
//console.log(person.calculSS());
//console.log(person.calculBIRPF());
  //  console.log(person.calcularRet2());
//    console.log(person.calculTIRPF());
//    console.log(person.calcularMPF());
    SNA = person.souB - person.getSS() - person.calculRIRPF();
    SNM = SNA / 12; //12 pagues
    TIRPF = person.calculTIRPF();
    SNM14 = calculPagues14(SBA,person.getSS(),TIRPF);
    PExtra = calculPExtra(SBA, TIRPF);
    GD = person.calculGD(); 
    
    document.getElementById('iSB').value = Number(person.getSou()).toLocaleString('es') + '€'; 
    document.getElementById('iSN').value = Number(SNA.toFixed(2)).toLocaleString('es') + '€';
    document.getElementById('iSM').value = Number(SNM.toFixed(2)).toLocaleString('es') + '€';
    document.getElementById('iSM14').value = Number(SNM14.toFixed(2)).toLocaleString('es') + '€'; 
    document.getElementById('iSMPE').value = Number(PExtra.toFixed(2)).toLocaleString('es') + '€'; 
    document.getElementById('iRN').value = Number(TIRPF.toFixed(2)).toLocaleString('es') + '%';
    document.getElementById('iRI').value = Number(((TIRPF * SBA)/100).toFixed(2)).toLocaleString('es') + '€';
    document.getElementById('iSS').value = Number(person.calculSS().toFixed(2)).toLocaleString('es') + '€';
    
    //Additionnal information
    document.getElementById('iBR').value = Number(person.calculBIRPF().toFixed(2)).toLocaleString('es') + '€';
    document.getElementById('iMPF').value = Number(person.calcularMPF().toFixed(2)).toLocaleString('es') + '€'; 
    document.getElementById('iDG').value = Number(GD.toFixed(2)).toLocaleString('es') + '€'; 
    document.getElementById('iRORT').value = Number(person.getRNT().toFixed(2)).toLocaleString('es') + '€'; 
    
    
    //We show the div resultats
    $("#Resultats").show();
    
    //Regarding the Number of income we show one or another.
    if (NP === "1") {
        $("#14pagues").hide(); 
        $("#12pagues").show(); 
    } else {
        $("#12pagues").hide();
        $("#14pagues").show();
    }

/*
* @Author: Pau Pujol
*/
}

//Càlcul Sou Net en 14pagues
function calculPagues14(souB, RSS, TIRPF){
    var SM = souB / 14;
    var SS = RSS / 12;
    var IRPF = SM * (TIRPF/100);
    
    return SM - SS - IRPF;
    
}
//Càlcul Paga Extra: sou Net 14 pagues
function calculPExtra(souB, TIRPF) {
    var SM = souB / 14;
    var IRPF = SM * (TIRPF/100);
    
    return SM - IRPF;
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












    