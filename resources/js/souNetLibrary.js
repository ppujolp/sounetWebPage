(function(global,$){
    
    var _DEBUG_ = true;
    
    var Sounet = function(edat, souB, CI, C, SF,MOV_GEO,D_CONT,D_CONT_MOV){
        return new Sounet.init(edat,souB,CI,C,SF,MOV_GEO,D_CONT,D_CONT_MOV);
    };
    

    //categoria professional 
    //Mínim en funció categoria professiona
    var cat_prof = [1051.50, 872.10, 758.70, 753.00, 753.00, 753.00, 753.00 ];
    //Bases seguretat Social SS
    var max_SS_anual = 3642 * 12;
    //contracte indifinit o no
    var indefinit = 0.0635;
    var notIndefinit = 0.064;
    //Deduccions
    //Rendiment del treball 
    var D_Rend = 2000;
    //Movilitat geográfica
    var D_Mov_Geo = 2000; 
    //Mínim Personal
    var D_MP = 5550;
    //Deducció Personal per disc < 65%
    var D_P_DiscLess65 = 3500;
    //Deducció Personal per disc < 65%
    var D_P_DiscMore65 = 7750;
    
    //Deduccions per discapacitats 
    //Deduccions per discapacitat contribuent
    //general 33 a 65%
    var D_disc_genenal = 3000;
    //Deduccions ajuda movilitat reduïda
    var D_mov_red = 3000;
    //Deduccions discapacitat > 65%
    var D_disc_more65 = 9000;
    
    
    //Trams retenció IRPF
    var trams_IRPF = {
        trams: [12450, 20200, 35200, 60000],
        retencio: [0.19, 0.24, 0.30, 0.37, 0.45],
    };
    
    //Taula deducció fills
    var taula_fills = [0, 2400, 2700, 4000, 4500];
    //Família nombrosa
    var nFillsMore3 = 600;
    //Deduccio fill < 3 anys
    var D_fill_less3 = 2800;
    
    
    //deduccions per ascendents
    //Deducció més 65 anys però menys de 75
    var D_More65 = 1150;
    //Deducció més de 75 anys
    var D_Less75 = 1400;
    
    //Taula situació familiar
    taula_SF = {
        situacio1: [0, 14.266, 15803],
        situacio2: [13.696, 14.985, 17.138],
        situacio3: [12.000, 12.607, 13.275]
    };
    

    
    //calcul per trams 
    function calculRet(ret) {
        var total_ret = 0; 
        
        if (ret<trams_IRPF.trams[0]) { 
            total_ret = ret * trams_IRPF.retencio[0];
        } else if (ret<trams_IRPF.trams[1]) {
            total_ret = trams_IRPF.trams[0] * trams_IRPF.retencio[0] +
                        (ret - trams_IRPF.trams[0])  * trams_IRPF.retencio[1];
        } else if (ret<trams_IRPF.trams[2]) {
            total_ret = trams_IRPF.trams[0] * trams_IRPF.retencio[0] +
                        (trams_IRPF.trams[1] - trams_IRPF.trams[0]) * trams_IRPF.retencio[1] +
                        (ret - trams_IRPF.trams[1])  * trams_IRPF.retencio[2];
        } else if (ret<trams_IRPF.trams[3]) {
             total_ret = trams_IRPF.trams[0] * trams_IRPF.retencio[0] +
                        (trams_IRPF.trams[1] - trams_IRPF.trams[0]) * trams_IRPF.retencio[1] +
                        (trams_IRPF.trams[2] - trams_IRPF.trams[1]) * trams_IRPF.retencio[2] +
                        (ret - trams_IRPF.trams[2])  * trams_IRPF.retencio[3];
        } else {
             total_ret = trams_IRPF.trams[0] * trams_IRPF.retencio[0] +
                        (trams_IRPF.trams[1] - trams_IRPF.trams[0]) * trams_IRPF.retencio[1] +
                        (trams_IRPF.trams[2] - trams_IRPF.trams[1]) * trams_IRPF.retencio[2] +
                        (trams_IRPF.trams[3] - trams_IRPF.trams[2]) * trams_IRPF.retencio[3] +
                        (ret - trams_IRPF.trams[3])  * trams_IRPF.retencio[4];
        }
        
        return total_ret;
        
    }
    
    
    //Càlcul Discapacitat contribuent 0:No disc, 1:Disc_general and 2:Disc > 65%
    function disc_contribuent(D_CONT, D_CONT_MOV) {
        var d_contribuent = 0;
        
        
        if (D_CONT == 2) {
            d_contribuent = D_disc_more65 + D_mov_red;
        } else if (D_CONT == 1) {
            if (D_CONT_MOV === true) {
                 d_contribuent = D_disc_genenal + D_mov_red;
            } else {
                d_contribuent = D_disc_genenal;
            }
        }
        return d_contribuent;
    }
    
    //Càlcul deduccions per descendents
    function calc_desc(nFills,nless3,exclusive){
        var D_desc = 0;
        switch(Number(nFills)) {
            case 0: D_desc = 0;break;
            case 1: D_desc = this.taula_fills[1]; break;
            case 2: D_desc = this.taula_fills[1] + this.taula_fills[2]; break;
            case 3: D_desc = this.taula_fills[1] + this.taula_fills[2] + this.taula_fills[3]; break;
            default: D_desc = this.taula_fills[1] + this.taula_fills[2] + this.taula_fills[3] + (this.taula_fills[4] * this.nFills); break;
        }
        
        if (nless3>0) {
            D_desc = D_desc + (nless3 * D_fill_less3);
        }
        
        if (exclusive === false) {
            D_desc = D_desc/2;
        } 
        
        return D_desc;
    }
    
    
    //Càlcul discapicats descendents
    function calc_disc_desc(nFills_disc_gen,nFill_Mov,nFills_disc_More65,exclusiu){
        var d_disc_gen = 0; 
        var d_disc_M65 = 0;
        var D_disc_desc = 0;
        if (nFills_disc_gen>0) {
            if (nFill_Mov > 0) {
                d_disc_gen = nFills_disc_gen * (D_disc_genenal + D_mov_red);
            } else {
                d_disc_gen = nFills_disc_gen * D_disc_genenal;
            }
        }
        
        if (nFills_disc_More65>0) {
            d_disc_M65 = nFills_disc_More65 * (D_disc_more65 + D_mov_red);
        }
        
        D_disc_desc = d_disc_gen + d_disc_M65;
            
        if (exclusiu === false) {
            D_disc_desc = D_disc_desc / 2;
        }
        
        return D_disc_desc;
    }
    
    
    //Càlcul deduccions ascendents
    function calc_D_asc(ASC65,ASC75,ASCLESS65D) {
        var D_asc = 0;
        D_asc = (ASC65 * D_More65) + (ASC75 * (D_Less75 + D_More65)) + (ASCLESS65D * D_More65);
        return D_asc; 
    }
    
    //Càlcul deduccions discapacitats ascendents
    function calc_D_Disc_Asc(nDISCPAL65,nDISCPA_MOV,nDISCPAM65) {
        var d_disc_gen = 0; 
        var d_disc_M65 = 0;
        var D_disc_desc = 0;
        if (nDISCPAL65>0) {
            if (nDISCPA_MOV > 0) {
                d_disc_gen = nDISCPAL65 * (D_disc_genenal + D_mov_red);
            } else {
                d_disc_gen = nDISCPAL65 * D_disc_genenal;
            }
        }
        
        if (nDISCPAM65>0) {
            d_disc_M65 = nDISCPAM65 * (D_disc_more65 + D_mov_red);
        }
        
        D_disc_desc = d_disc_gen + d_disc_M65;
        
        return D_disc_desc;
    }
    
    //RNT = Salari Brut - SS
    function calculRNT(salariB,nSS){
        var RNT = 0;
        
        if ((salariB - nSS)<=11250) {
            RNT = 3700;
        } else if ((salariB - nSS) <= 14450) {
            RNT = 3700 - (1.15625 * (salariB - nSS - 11250));
        }
        
        return RNT;
    }
    
   
    /********* method global world will have access ******/
    Sounet.prototype = {
        getEdat: function() {
            return this.edat;
        },
        
        getSou: function() {
            return this.souB;
        },
        
        //Càlcul Seguretat Social
        calculSS: function() {
            var SS = 0;
            var nSouSS = this.souB;
            
            if (this.souB > max_SS_anual) {
                nSouSS = max_SS_anual;     
            } else if (this.souB < this.C * 12) {
                nSouSS = this.C * 12;
            }
            
            if (this.indefinit === true) {
                SS =  (nSouSS * indefinit);
            } else {
                SS = (nSouSS * notIndefinit);
            }
            
            this.nSS = SS || 0;
            return SS;

        },
        
        //Càlcul Base IRPF
        //BIRPF = SouBrut - SS - RT - MovGeo - RNT - Discpacitats - Deduccions per Fills
        calculBIRPF: function(){
            var BIRPF = 0;
            
            if (this.MOV_GEO === true) {
                BIRPF = this.souB - this.nSS - D_Rend - D_Mov_Geo;
            } else { 
                BIRPF = this.souB - this.nSS - D_Rend;
            }
            
            if (this.D_CONT == 1) {
                if (this.D_CONT_MOV === true) {
                    BIRPF = BIRPF - D_P_DiscMore65;
                } else { 
                    BIRPF = BIRPF - D_P_DiscLess65;
                }
            } else if (this.D_CONT == 2) {
                BIRPF = BIRPF - D_P_DiscMore65;
            }
            if (this.nFills>2) {
                BIRPF = BIRPF - nFillsMore3;
            }
            
            BIRPF = BIRPF - calculRNT(this.souB, this.nSS);
            
            if (BIRPF < 0) {
                BIRPF = 0;
            }
            return BIRPF;
        },
        
        //Mínims Familiars
        calcularRet1: function() {
            var MF;
            MF = D_MP + disc_contribuent(this.D_CONT, this.D_CONT_MOV);
            MF = MF + calc_desc(this.nFills,this.nless3,this.exclusiu);
            MF = MF + calc_disc_desc(this.nFills_disc_gen,this.nFill_Mov,this.nFills_disc_More65,this.exclusiu);
            MF = MF + calc_D_asc(this.ASC65,this.ASC75,this.ASCLESS65D);
            MF = MF + calc_D_Disc_Asc(this.nDISCPAL65,this.nDISCPA_MOV,this.nDISCPAM65);
            
            if (_DEBUG_===true) {
                console.log("MF: " + MF);
            }
            return calculRet(MF);
        },
        
        //Càlcul Mínim Personal i Familiar
        calcularMPF: function() {
            var MPF = 0;
            MPF = D_MP + disc_contribuent(this.D_CONT, this.D_CONT_MOV);
            
            return MPF;
        },
        
        //Base IRPF
        calcularRet2: function() {
            return calculRet(this.calculBIRPF());
        },
        
        //Càlcul Retenció IRPF        
        calculRIRPF: function() {
            var ret2 = this.calcularRet2();
            var ret1 = this.calcularRet1();
            var RIPF = ret2 - ret1;
            return RIPF;
        },
        
        
        //Tipus IRPF
        calculTIRPF: function() {
            var TIRPF = 0;
            var exempt = false;
            //Situació Familiar exempt de retenció
            if (this.souB < this.taula_SF.situacio2[2]) {
                if (this.SF === 1){
                    if ((this.nFills === 1) && (this.souB < this.taula_SF.situacio1[1])){
                        exempt = true;
                    } else if ((this.nFills > 1) && (this.souB < this.taula_SF.situacio1[2])){
                        exempt = true;
                    }
                } else if (this.SF === 2) {
                    if ((this.nFills === 0) && (this.souB < this.taula_SF.situacio2[0])){
                        exempt = true;
                    }
                    if ((this.nFills === 1) && (this.souB < this.taula_SF.situacio2[1])){
                        exempt = true;
                    } else if ((this.nFills > 1) && (this.souB < this.taula_SF.situacio2[2])){
                        exempt = true;
                    }
                } else {
                    if ((this.nFills === 0) && (this.souB < this.taula_SF.situacio3[0])){
                        exempt = true;
                    }
                    if ((this.nFills === 1) && (this.souB < this.taula_SF.situacio3[1])){
                        exempt = true;
                    } else if ((this.nFills > 1) && (this.souB < this.taula_SF.situacio3[2])){
                        exempt = true;
                    }
                    
                }
            }
            //Si exempt la retenció és 0%
            if (exempt === true) {
                return 0;
            }
            
            
            var RIRPF = this.calculRIRPF();
            if (RIRPF > 0) {
                TIRPF = RIRPF / this.souB;
            }

            return Math.floor(TIRPF*10000)/100;
        },
        
        
        //Fills
        setDadesFills: function(nFills,nless3,exclusiu) {
            var self = this;
            self.nFills = nFills || 0;
            self.nless3 = nless3 || 0;
            self.exclusiu = exclusiu || false;
            
            if (nless3>nFills) {
                alert("El número de descendientes menores de 3 años no puede ser superior al número de descendientes totales");
                return -1;
            }
            
            return 0;
        },
        
        //Discapacitat Fills
        setDiscDesc: function(nFills_disc_gen,nFill_Mov,nFills_disc_More65) {
            var self = this;
            self.nFills_disc_gen = nFills_disc_gen || 0;
            self.nFill_Mov = nFill_Mov || 0;
            self.nFills_disc_More65 = nFills_disc_More65 || 0;
            var nFills_disc = parseInt(nFills_disc_gen) + parseInt(nFills_disc_More65);
            
            if (nFills_disc >this.nFills) {
                alert("El número de descendientes con discapacidad no puede ser superior al número de descendientes totales");
                return -1;
            }
            
            return nFills_disc;
        },
        
        //Número de Ascendents al nostre càrrec
        setNumAsc: function(ASC65,ASC75,ASCLESS65D) {
            var self = this;
            self.ASC65 = ASC65 || 0;
            self.ASC75 = ASC75 || 0;
            self.ASCLESS65D = ASCLESS65D || 0;
        },
        
        //Número d'ascendents amb discapacitat
        setDiscAsc: function(nDISCPAL65,nDISCPA_MOV,nDISCPAM65){
            var nAsc, nAscDiscp;
            var self = this;
            self.nDISCPAL65 = nDISCPAL65 || 0; 
            self.nDISCPA_MOV = nDISCPA_MOV || 0;
            self.nDISCPAM65 = nDISCPAM65 || 0;
            
            if (this.nDISCPA_MOV > this.nDISCPAL65) {
                alert("El número de personas Ascendientes con movilidad reducida no puede ser superior al número de personas con discapacidad general");
                return -1;
            }
            
            nAsc = parseInt(this.ASC65) + parseInt(this.ASC75) + parseInt(this.ASCLESS65D);
            nAscDiscp = parseInt(this.nDISCPAL65) + parseInt(this.nDISCPA_MOV) + parseInt(this.nDISCPAM65);
            
            if (nAscDiscp > nAsc) {
                alert("El número de personas Ascendientes con discapacidad no puede ser superior al número total de personas ascendientes");
                return -1;
            }
            
            return 0;
        }
        
        
    };
    
    Sounet.init = function(edat, souB, CI, C, SF, MOV_GEO,D_CONT,D_CONT_MOV) {
        
        var self = this;
        self.edat = edat;
        self.souB = souB || 0;
        self.indefinit = CI || true;
        self.C = cat_prof[C] || cat_prof[0];
        self.SF = SF || 3;
        self.MOV_GEO = MOV_GEO || false;
        self.D_CONT = D_CONT || 0;
        self.D_CONT_MOV = D_CONT_MOV || false;
    };
    
    Sounet.init.prototype = Sounet.prototype;
    
    global.Sounet = global.G$ = Sounet;
    
}(window,jQuery));


/*
* @Author: Pau Pujol
*/