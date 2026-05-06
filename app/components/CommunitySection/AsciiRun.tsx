"use client";

import { useEffect, useState } from "react";

const FRAMES = [
  `
                     ,dlc:;.           
                     .,;lkOx,           
                     .,,cxkd'           
                     ,c;cccl'           
                   ..',:ol;.            
                  .....,lko.            
                '::'..,,;dxl.           
             .';:;,'..,:;:dxl:,.....    
             ,c,:c:,..,::;:odddoooddl.  
              .;:oc,'':llclddd:',,cko.  
               ';::,,:dkdl:,,,.   .,.   
               ':',;:oOOdo:..           
               :d,,:clddk00Odc,         
               ,l,;:ccc:coxk00Od:,      
              .;;;:cccc;.,::cldxxd,     
             .:;,::ccc,   ,:;;;cdd'     
        ..,,,cc;;::;,.       .,lxd'     
 ..,c:,;ccclooc::c,          .,:od,     
:dxoc:;;;;;;:cc;'.           ';,co'     
ldoc:;''',.....              .',cd,     
lll;.                         .;cxd,..  
cl;.                          .:;cddddl.
::.                            .,,,,,,' 
                                        
                                        
                                        

`,
  `
                      .'cxc.            
                      .:cdOo'           
                     .,';dOxo'          
                      ';:ccll.          
                   .lc;:oo;'.           
                  ':;,';dkl.            
                  ',..',dko;            
                ';;'..',lkoo'           
               .:::,..,,:oxxo:,....     
               .:co:.':cc:cloddddodc.   
                ,:;;,:dkdl:'',:llooc.   
                ':,;:oOOoo'    ....     
                .;';:lxkxko,            
                .;',:codk00ko.          
                ':,,::lc:lk00x;.        
   .::cc,...   .::,;::cl:;:cdkko.       
  ,cddxollll:;lxd:,;:clc'',;:cdd,       
.:oc:,;lc:;;:ccodl::cco'   .:cxd'       
,d:.. ......'',;;::ccl;    .;:dd'       
 .             ..;,,,;.    ':;co;       
                           .:::od,      
                            'c:ox;      
                            .::lxdc,.   
                            .cccloddx,  
                              ........  
                                        

`,
  `
                       .''''.           
                      .:clxx:           
                      .;,lOOd'          
                      .;,cllo'          
                    .';:ll:::.          
                   .c;':xxo,            
                  .''.,dOxo;            
                  ,,..;xxoll'           
                 ;:'..:xxlcl'           
                .:;'.';cddd:.           
                 .;,,;llcldxo:,.        
                .;;;:oOOo;:lddxxl.      
                .;',:lOOd;.':looo'      
                .,'',;okkx:  ',,'.      
         ....    .,'.,:oxkkc.           
       ,ldxkxl;'..,;'',cokOk:           
     .clccccc::cllool:;:lldkx;          
    .;,'.....,:c;::llllclccodx;         
              ...'.,;;::cccol:.         
                    ..';::odo'          
                       'c;clo'          
                       'c;:lc.          
                       'l:cd,           
                       'lcoxo,          
                       'lccoddl:.       
                       ,ollloooc.       

`,
  `
                        .''.            
                      .;,lxo,           
                      .,,lOOx'          
                      .;,:ooo'          
                   .'';:cl:,:.          
                   'l:;oxol'            
                  .,,:dkdoo;            
                  'cldxlclll'           
                .ccokko:ccc:.           
                .;::coxoccl'            
                 .;,';lxolx;            
                .;;;:codddoc:,          
                .;',:lkkddoclo:.        
                .''.',:oddol:;:.        
             ..  .,'..';coxx:           
            :dxo:,,;,,,,,:oxxl.         
          .lodddlcc:::ccclloxxo.        
         .colll:'.,:;;;;:cccldd,        
          ;oc'.   .loc:;::ccc:,.        
           .      ;c:cllll;..           
                 'l:;cll,               
                .cc::cc,                
                'l::llc.                
               .cllodd,                 
               'lccoddl:;.              
               'l:;:clodd,              

`,
  `
                      ';''',.           
                      'ccdkk:           
                     .,';dOko.          
                     .;;:cclc.          
                    .;lcolc;.           
                  ':cldxdod,            
                ':oxkxoccoo;            
              .:cdxlc:;:clld,           
               ';dk:'',:ccc;.           
               .,:do;,;clcll,..         
                .,cooloxdccclcc;;:.     
                .,,cdxOOdl:,,;::cl'     
                .,';cokkOOko::'...      
                ':'',,;:coxkOko,.       
                'c,;ccc:;,;:ldkkxo.     
                'c,:lodolc::codddd,     
                'c,:clllc:::ccc:::.     
               .llccc::;;;::,'...       
              ':lloolccl:...            
            .:cclloooo;.                
           .:c;:ccodd:                  
          'cc::c:;;;:.                  
        'colllc'                        
        ;lclod,                         
         .:odx:.                        
          'ooddx,                       

`,
  `
                       ;lo:.            
                      .;lkOo.           
                     .,':xkxc.          
                     ,l;cc:ld,          
                  ...;lool,.            
                .:ldoddood;             
             .,:oddlc:;;ldo'            
             .;okd:,.';:ccc'            
             ,c:xkl,.',:ccc:;'..,;:,    
             .;:okc''':llc;,;;:;,;:o,   
               ,ldl,,:dkdc;'....,,:;.   
               .cdo::lkOxdl,.           
               ;dcc;;:lodxkOkdc,.       
               :o,,,,,,,;;:loxkkko:.    
               ';;cllc:,.';,,;;cdxd,    
              ':;:clcc,   ..::;cdo:.    
            .,:;;:c:,'     'l::loo'     
         ';cooc;::;.      .cc;:co:.     
       'clccllc:;.        ;l:;:l;       
    .,clc:;:c;;'         :ol::ll.       
  .coolccc:,'           'oollod:        
  .:clloc'              .coooxxxl,.     
   'lod:                  .,cddddd,     
   .cod,                     .....      
     ..                                 
                                        

`,
  `
                      ;xc::.            
                     .,;lkOo.           
                     .,'cxkd,           
                     'c;cc:l'           
                ...',:ldoc;,.           
               'cdddoodood:             
             .:oddoc:;;:ldo'            
             .:dko:'.';:ccc'     .'.    
             .:lkxc,.',:ccc;,,,',col.   
              ':dxl,.':llc;,;;::;;::.   
               'odc,;:dkdl,........     
               .odc;cokOxdl,.           
               .::,,;;coxkOOko,.        
               .:,;,,,,,;:codkkko:,     
              .:;:clccc;,:;;;:coxxx,    
             'l:;:ccc:'. .,:':c;lxd'    
      ..,;,;;cc;:cc;'.       ;l;lxd'    
 ,clc;cl::clol:;:l;          .;,:oo'    
.loooc::;;;c;...''            .,;cl'    
'llll:;;.....                 .'':l'    
:lo;.                          .,;o:.   
:ol.                           .;;oxdc;,
 ..                             ':coooc;
                                 .....  
                                        
                                        

`,
  `
                      .':xc.            
                     .:ccxOd'           
                     ,l';dOxo'          
                      ';:ccll.          
                  .,,:clol,'.           
                 'lddddxdoc.            
               'codxkdc:cdo;.           
              'loxd:,,;:cclc.           
              'ccxx;.',:ccc;.           
              .;:ld:'';llccol;;,;:,.    
               .;col:cdkdc:ccc:;:cl.    
                'ccdxxOOdoc....,,.      
                .;:ododkOOx:            
                .:,,,,,:oxOOo,          
      ..        'c;:cc:,,;cdkko'        
    'ldxl,......;:;cooooc;;;cdkd:.      
   ;olodolcccloxdc;cllo:..',;:oxd'      
 .clloc,,:c:;;:loc:clld;   ,l;lxd,      
 .;,''.  .....'.',;:cl:.   'c;cdd,      
                 .....     'l;:lo'      
                           .;:;:l'      
                            .:;:l:.     
                             .::oxl'.   
                             'c:oxxool. 
                             .,,,;;;;,  
                                        

`,
  `
                       .''''.           
                      .cclxx:           
                      .;,lOOd'          
                      .;,cllo'          
                    .';cll:::.          
                   ,c:cdxol;            
                  ;lcokxooo;            
                 ;loxxocclll'           
                'ccxOd::cccl'           
                .::ldxocccl'            
                 ':,,cdxold:..          
                .;,;:coxdllllol.        
                .;';:lodxxoc:cll.       
                .,'.',:llod;';'.        
         ,::,.   .:'..';cdxo.           
      .,looxxl;;;';:,'',;cdxl.          
     .:ollc:cc::cloooc;;;;cdd:.         
     .:,,.. .';;:,;clc:cc:;cdd,         
               ..';;c:;;cc:loo'         
                    ..':c::oo;          
                       'c;:ll'          
                       'c;;co'          
                       .c:;co,          
                       'l::od:          
                       'lcldxdc:.       
                       'lcloddod,       

`,
  `
                        .''.            
                      .;,lxo,           
                      .,,lOOx'          
                      .;,:ooo'          
                   ..,;:cl:,:.          
                   'l:,cxdl'            
                  .,'';xkdo;            
                  .,''lkdlll'           
                  ''.,okocc:.           
                 .;'.':dxol'            
                 .:,',:cldxo,.          
                .;;;:lkklcodxoc.        
                .;';:oOOdooloddl.       
                .''',:okkxxl;coc.       
             ... .,'.':oxOOo,.'.        
            :dxxl::;'',coxOOx:          
          .looodolc;,'':lloxkx:.        
         .coooc,,,',c:,;cc:clol.        
          ';;'     .:c;;cl:,'.          
                  ':cccll:.             
                 'l:;:cll'              
                 ;c;;:co;               
                'l;;;:l:                
               .cc;:ll:.                
               'lcldxdol;               
               'lcldxxdool.             

`,
  `
                      ';''',.           
                      'ccdkx:           
                     .,';dOko'          
                      .,;cclc.          
                    ..':llc;.           
                   .,'';dxo.            
                 .,,..';xko;            
                .c;'..';dxlo,           
               .';;'..',lxxxo,          
               ,c:l:'';::codxxo::,.     
               .cc;;,;oxoc;;lloddxdc.   
                ,c,;:oOOol;...';:lll'   
                .;';:lkkkkxl:.   ..     
                .;',:cddxO00Od:,        
                ':',;:ll::coxOOko,      
                .;',::clc::clooddc.     
                ':';:ccc:;;::;::,.      
               .lc,;:cc:::l:. ..        
              'clc:::clc'.'.            
            .ccccllll:'                 
           .cc;:ccldd,                  
          'cc;;::'...                   
        ,loc;:lc.                       
       'ooollo;                         
        ,loxxd:..                       
         ;oddddx,                       

`,
  `
                      .:doc,.           
                     .;:lkOk,           
                     .;,cxkxc.          
                     ,c;cc:ld,          
                   .'',:ol,.            
                  .''..,okl.            
                 .,'..,,:xx;            
              .,,,,'..,;;cxx:''..       
              .;:c:'..,::;cdxxdddl::'   
              '::oc,'':ll:ll:;c:cool;.  
              .;:::,,:dkdl:'. .. ...    
               .'',;:oOOdo;..           
                .,,:clxxkOOOdc,         
               .:,,:cclccoxk00Od:'      
               ',,;:ccc;;c;;:coxxd'     
              ':,;:ccc:..'':::loc:.     
            .,:;;::cc,    ,l:coo:.      
         ,;cool:::;..    .cc;:lc.       
       'clcccll::;.      ;oc:lo'        
   .,;cc::::cl:..       :oolod:         
 .ldol:::c:,'..        ,olloxx:         
 'oddll:'.              ..:odxx:        
 .codoc.                   ,;;::.       
  .cooo'                                
    ';:.
    
    
`,
];

export default function AsciiRun() {
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, 100);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section data-nav-theme="light" className="flex items-center place-content-between p-40">
      <h1 className="text-5xl font-bold leading-none tracking-tight text-ink md:text-6xl lg:text-[10rem]">Community</h1>
      {/* <div>
        <pre className="font-mono leading-none text-sm select-none text-ink">{FRAMES[frame]}</pre>
        {process.env.NODE_ENV === "development" && (
          <div className="flex gap-2 mt-2 text-xs font-mono">
            <button onClick={() => setPaused((p) => !p)}>{paused ? "▶ play" : "⏸ pause"}</button>
            {paused && (
              <>
                <button onClick={() => setFrame((f) => (f - 1 + FRAMES.length) % FRAMES.length)}>← prev</button>
                <button onClick={() => setFrame((f) => (f + 1) % FRAMES.length)}>next →</button>
                <span>
                  frame {frame + 1} / {FRAMES.length}
                </span>
              </>
            )}
          </div>
        )}
      </div> */}
    </section>
  );
}
