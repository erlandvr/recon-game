import {useState} from 'react';
import App from './App.tsx';
import SpeedGame from './SpeedGame.tsx';
import Brand from './Brand.tsx';
import Scoreboard,{PendingScores} from './Scoreboard.tsx';

export default function GameEntry(){
 const [mode,setMode]=useState<'speed'|'long'|null>(null);
 const [scoreboard,setScoreboard]=useState(false),[highlight,setHighlight]=useState<string|null>(null);
 if(mode==='long')return <App onChooseMode={()=>setMode(null)}/>;
 if(mode==='speed')return <SpeedGame onChooseMode={()=>setMode(null)}/>;
 return <div className="app mode-entry">
  <header className="masthead"><Brand subtitle="Keep the ecosystem alive." onClick={()=>{}}/><button onClick={()=>setScoreboard(true)}>View scoreboard</button></header>
  <main className="mode-intro"><span className="mission-eyebrow">Your next assignment</span><h1>Take control.<br/>Make it autonomous.</h1><p>Welcome to SumZero. You’re the Recon operator.<br/>Scan for problems, fix findings and put routine work on autopilot.</p>
   <div className="mode-options">
    <article><span className="mode-duration">5–8 min</span><h2>Speed Game</h2><p>One system. Three growing waves. Fifteen to master. A race to full autonomy.</p><ul><li>Restore, earn and expand</li><li>Upgrade your models. Automate the ecosystem.</li><li>Keep playing until full autonomy</li></ul><button onClick={()=>setMode('speed')}>Choose Speed Game</button></article>
    <article><span className="mode-duration">~20 min</span><h2>Long Game</h2><p>Build a company from one backend to 100 repositories.</p><ul><li>The original game</li><li>Six chapters and deeper investment</li><li>No time limit</li></ul><button onClick={()=>setMode('long')}>Choose Long Game</button></article>
   </div><p className="mode-footnote">Speed Game starts at GO! after the countdown. Desktop and laptop.</p><PendingScores onScoreboard={id=>{setHighlight(id);setScoreboard(true);}}/>
  </main>
 {scoreboard&&<Scoreboard highlight={highlight} onClose={()=>{setScoreboard(false);setHighlight(null);}}/>}</div>;
}
