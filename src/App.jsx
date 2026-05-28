import React, { useState, useEffect } from 'react';

// CONSTANT PLANET DATABASE (Pillar 2: Data layer)
const PLANET_DATA = {
  '🌟 Nebula-Prime': { 
    distance: 4, resource: 'copper', resourceName: '🥉 Copper', yield: 2, 
    risk: 'None', minPower: 1, reqText: 'Unlocked by Default' 
  },
  '🌋 Magma-7': { 
    distance: 10, resource: 'titanium', resourceName: '🥈 Titanium', yield: 1, 
    risk: 'High Heat (Req 20+ GW)', minPower: 20, reqText: 'Requires 100 Copper' 
  },
  '💎 Chronos-Void': { 
    distance: 18, resource: 'antimatter', resourceName: '🌌 Antimatter', yield: 1, 
    risk: 'Gravity Shear (Req 50+ GW)', minPower: 50, reqText: 'Requires 50 Titanium' 
  }
};

export default function App() {
  // --- STATE MANAGEMENT ---
  const [shipName, setShipName] = useState('');
  const [targetPlanet, setTargetPlanet] = useState('🌟 Nebula-Prime'); 
  const [laserPower, setLaserPower] = useState('');
  const [cargoHold, setCargoHold] = useState('');
  
  // Game progression & metrics
  const [inventory, setInventory] = useState({ copper: 0, titanium: 0, antimatter: 0 });
  const [fleet, setFleet] = useState([]);
  const [activePlanetInfo, setActivePlanetInfo] = useState('🌟 Nebula-Prime');

  // SMART RULES: Dynamic Unlocks based on Inventory
  const isMagmaUnlocked = inventory.copper >= 100;
  const isChronosUnlocked = inventory.titanium >= 50;
  const isVictoryAchieved = inventory.antimatter >= 100;

  // --- ENGINE GAME LOOP (Pillar 2: Real-time automation) ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Temporary tracker for what is mined this exact second
      let tickMined = { copper: 0, titanium: 0, antimatter: 0 };

      setFleet((currentFleet) =>
        currentFleet.map((ship) => {
          // Rule A: Flight countdown
          if (ship.status === '🚀 En Route') {
            const nextTime = ship.timeRemaining - 1;
            return {
              ...ship,
              timeRemaining: nextTime,
              status: nextTime <= 0 ? '⛏️ Mining' : '🚀 En Route'
            };
          }
          
          // Rule B: Mining extraction
          if (ship.status === '⛏️ Mining') {
            const planet = PLANET_DATA[ship.planet];
            
            // Efficiency Penalty if ship is underpowered
            let efficiencyModifier = ship.power >= planet.minPower ? 1 : 0.25;

            // Calculate yield based on ship power
            const amount = Math.ceil((ship.power / 10) * planet.yield * efficiencyModifier);
            
            // Add to the global tick tracker
            tickMined[planet.resource] += amount;
            
            return {
              ...ship,
              totalMined: ship.totalMined + amount
            };
          }
          
          return ship;
        })
      );

      // Deposit the tick tracker into the global inventory
      setInventory((prev) => ({
        copper: prev.copper + tickMined.copper,
        titanium: prev.titanium + tickMined.titanium,
        antimatter: prev.antimatter + tickMined.antimatter
      }));

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // --- FOOLPROOF VALIDATION (Pillar 4) ---
  const isFormInvalid = 
    !shipName.trim() || 
    !laserPower || Number(laserPower) <= 0 || 
    !cargoHold || Number(cargoHold) <= 0;

  // --- HANDLERS ---
  const handleLaunchShip = (e) => {
    e.preventDefault();
    if (isFormInvalid) return;

    const newShip = {
      id: Date.now(),
      name: shipName,
      planet: targetPlanet,
      power: Number(laserPower),
      capacity: Number(cargoHold),
      timeRemaining: PLANET_DATA[targetPlanet].distance,
      status: '🚀 En Route',
      totalMined: 0
    };

    setFleet([...fleet, newShip]);
    setShipName('');
    setLaserPower('');
    setCargoHold('');
  };

  const handleMoveShip = (shipId, newPlanet) => {
    setFleet((currentFleet) =>
      currentFleet.map((ship) => {
        if (ship.id === shipId) {
          return {
            ...ship,
            planet: newPlanet,
            timeRemaining: PLANET_DATA[newPlanet].distance,
            status: '🚀 En Route',
            totalMined: 0 // Reset local hold when moving
          };
        }
        return ship;
      })
    );
  };

  const handleScrapFleet = () => {
    if (window.confirm("CRITICAL WARNING: This will wipe your fleet and inventory. Continue?")) {
      setShipName('');
      setTargetPlanet('🌟 Nebula-Prime');
      setLaserPower('');
      setCargoHold('');
      setFleet([]);
      setInventory({ copper: 0, titanium: 0, antimatter: 0 });
    }
  };

  // --- DAY 3 HOOKS ---
  const handleSaveGame = () => { alert("Day 3 Feature: Generates a JSON save file of your fleet and materials!"); };
  const handleLoadGame = () => { alert("Day 3 Feature: Uploads your JSON save file to restore progress!"); };

  return (
    <div style={styles.container}>
      {/* HEADER & RESOURCE INVENTORY */}
      <header style={styles.header}>
        <div style={styles.topHeaderRow}>
          <h1>🌌 Cosmic Tycoon: Discovery Protocol</h1>
          <div style={styles.inventoryBank}>
            <span style={styles.invItem}>🥉 Copper: <strong>{inventory.copper}</strong></span>
            <span style={isMagmaUnlocked ? styles.invItem : styles.invItemLocked}>
              {isMagmaUnlocked ? `🥈 Titanium: ${inventory.titanium}` : '🔒 ???'}
            </span>
            <span style={isChronosUnlocked ? styles.invItem : styles.invItemLocked}>
              {isChronosUnlocked ? `🌌 Antimatter: ${inventory.antimatter}` : '🔒 ???'}
            </span>
          </div>
        </div>
      </header>

      {/* VICTORY/SYNERGY BANNER */}
      <div style={isVictoryAchieved ? styles.victoryBanner : styles.synergyBanner}>
        {isVictoryAchieved 
          ? "🏆 UNIVERSE CONQUERED! You have harnessed 100 Antimatter. The galaxy is yours." 
          : "⚡ System Core: Harvest materials to unlock deep space coordinates."}
      </div>

      <main style={styles.mainLayout}>
        
        {/* LEFT COLUMN: CONTROL & SHIPYARD PANEL */}
        <section style={styles.panel}>
          <h2>⚙️ Shipyard Assembly Bay</h2>
          <form onSubmit={handleLaunchShip} style={styles.form}>
            
            <div style={styles.inputGroup}>
              <label>Vessel Designation Name *</label>
              <input 
                type="text" 
                placeholder="e.g., Star-Hauler IV" 
                value={shipName}
                onChange={(e) => setShipName(e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Initial Destination Target</label>
              <select value={targetPlanet} onChange={(e) => setTargetPlanet(e.target.value)}>
                <option value="🌟 Nebula-Prime">🌟 Nebula-Prime (Yields Copper)</option>
                {isMagmaUnlocked && <option value="🌋 Magma-7">🌋 Magma-7 (Yields Titanium)</option>}
                {isChronosUnlocked && <option value="💎 Chronos-Void">💎 Chronos-Void (Yields Antimatter)</option>}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label>Mining Laser Efficiency (GigaWatts) *</label>
              <input type="number" placeholder="Minimum 1 GW" min="1" value={laserPower} onChange={(e) => setLaserPower(e.target.value)} />
            </div>

            <div style={styles.inputGroup}>
              <label>Cargo Capacity Limits (Tons) *</label>
              <input type="number" placeholder="Minimum 1 Ton" min="1" value={cargoHold} onChange={(e) => setCargoHold(e.target.value)} />
            </div>

            <button type="submit" disabled={isFormInvalid} style={isFormInvalid ? styles.disabledBtn : styles.submitBtn}>
              🛠️ Construct & Launch Ship
            </button>
          </form>

          <hr style={styles.divider} />

          {/* INTERACTIVE PLANET CONSOLE */}
          <div style={styles.planetConsole}>
            <h3>🪐 Planetary Sector Map</h3>
            <div style={styles.planetButtonGroup}>
              {Object.keys(PLANET_DATA).map(name => {
                const isLocked = 
                  (name === '🌋 Magma-7' && !isMagmaUnlocked) || 
                  (name === '💎 Chronos-Void' && !isChronosUnlocked);

                return (
                  <button 
                    key={name}
                    onClick={() => setActivePlanetInfo(name)}
                    style={activePlanetInfo === name ? styles.activePlanetBtn : (isLocked ? styles.lockedPlanetBtn : styles.planetBtn)}
                  >
                    {isLocked ? `🔒 Unknown Space` : name}
                  </button>
                );
              })}
            </div>
            
            <div style={styles.planetDataCard}>
              <h4>{activePlanetInfo} Specifications</h4>
              <p>• Extractable Resource: <strong>{PLANET_DATA[activePlanetInfo].resourceName}</strong></p>
              <p>• Unlock Condition: {PLANET_DATA[activePlanetInfo].reqText}</p>
              <p style={{ color: PLANET_DATA[activePlanetInfo].minPower > 1 ? '#ff4757' : '#2ed573' }}>
                • Atmospheric Risk: {PLANET_DATA[activePlanetInfo].risk}
              </p>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* BACKUP OPERATIONS */}
          <div style={styles.controlBox}>
            <div style={styles.btnRow}>
              <button onClick={handleSaveGame} style={styles.utilityBtn}>Backup (.JSON)</button>
              <button onClick={handleLoadGame} style={styles.utilityBtn}>Load Map</button>
            </div>
            <button onClick={handleScrapFleet} style={styles.resetBtn}>Decommission All Systems (Reset)</button>
          </div>
        </section>

        {/* RIGHT COLUMN: LIVE SIMULATION DISPLAY */}
        <section style={styles.panel}>
          <h2>🛰️ Live Sector Telemetry Network</h2>
          
          {fleet.length === 0 ? (
            <p style={styles.placeholderText}>No spacecraft deployed. Build a vessel to begin extracting copper from Nebula-Prime.</p>
          ) : (
            <div style={styles.outputContainer}>
              {fleet.map((ship) => {
                const isUnderpowered = ship.power < PLANET_DATA[ship.planet].minPower;
                const resourceExtracted = PLANET_DATA[ship.planet].resourceName;
                
                return (
                  <div key={ship.id} style={styles.shipCard}>
                    <div style={styles.shipCardHeader}>
                      <strong>🚀 {ship.name}</strong>
                      <span style={ship.status === '⛏️ Mining' ? styles.statusMining : styles.statusTransit}>
                        {ship.status === '🚀 En Route' ? `🛰️ Flight Time: ${ship.timeRemaining}s` : '⛏️ Extracting'}
                      </span>
                    </div>

                    <div style={styles.shipCardStats}>
                      <span>⚡ Power: {ship.power} GW</span>
                      <span style={{ color: '#eccc68', fontWeight: 'bold' }}>{resourceExtracted}</span>
                      <span>Total: {ship.totalMined}</span>
                    </div>

                    <div style={styles.navigationControlBox}>
                      <span style={{ fontSize: '12px', color: '#a4b0be' }}>Orbiting: <strong>{ship.planet}</strong></span>
                      
                      <div style={styles.redirectRow}>
                        <label style={{ fontSize: '11px', color: '#fff' }}>Redirect Course:</label>
                        <select 
                          value={ship.planet}
                          onChange={(e) => handleMoveShip(ship.id, e.target.value)}
                          style={styles.inlineSelect}
                        >
                          <option value="🌟 Nebula-Prime">🌟 Nebula-Prime</option>
                          {isMagmaUnlocked && <option value="🌋 Magma-7">🌋 Magma-7</option>}
                          {isChronosUnlocked && <option value="💎 Chronos-Void">💎 Chronos-Void</option>}
                        </select>
                      </div>
                    </div>

                    {ship.status === '⛏️ Mining' && isUnderpowered && (
                      <div style={styles.warningAlert}>
                        ⚠️ <strong>EFFICIENCY ALERT:</strong> Ship is underpowered for this planet! Mining speed severely reduced.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

// --- VISUAL STYLING SYSTEM ---
const styles = {
  container: { fontFamily: '"Lucida Console", Monaco, monospace', padding: '20px', maxWidth: '1300px', margin: '0 auto', color: '#e0e0e0', backgroundColor: '#060913', minHeight: '100vh' },
  header: { borderBottom: '3px solid #70a1ff', paddingBottom: '15px', marginBottom: '15px' },
  topHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' },
  inventoryBank: { display: 'flex', gap: '15px', backgroundColor: '#1e272e', padding: '12px 20px', borderRadius: '6px', border: '2px solid #34495e' },
  invItem: { color: '#fff', fontSize: '14px' },
  invItemLocked: { color: '#57606f', fontStyle: 'italic', fontSize: '14px' },
  synergyBanner: { backgroundColor: '#1b263b', color: '#74b9ff', padding: '10px 15px', borderRadius: '6px', marginBottom: '20px', border: '1px dashed #415a77', fontSize: '13px' },
  victoryBanner: { backgroundColor: '#f39c12', color: '#fff', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '2px solid #e67e22', fontSize: '15px', fontWeight: 'bold', textAlign: 'center', animation: 'blink 2s infinite' },
  mainLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
  panel: { backgroundColor: '#0d1527', border: '1px solid #23314f', borderRadius: '8px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  divider: { margin: '25px 0', border: 'none', borderTop: '1px dashed #23314f' },
  submitBtn: { backgroundColor: '#eccc68', color: '#111', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' },
  disabledBtn: { backgroundColor: '#1e272e', color: '#57606f', padding: '12px', border: '1px solid #2f3542', borderRadius: '4px', cursor: 'not-allowed', fontSize: '13px', textTransform: 'uppercase' },
  
  planetConsole: { display: 'flex', flexDirection: 'column', gap: '10px' },
  planetButtonGroup: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  planetBtn: { backgroundColor: '#1b263b', color: '#fff', border: '1px solid #415a77', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  activePlanetBtn: { backgroundColor: '#70a1ff', color: '#000', border: '1px solid #70a1ff', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  lockedPlanetBtn: { backgroundColor: '#0a0d14', color: '#4b5563', border: '1px dashed #23314f', padding: '8px 12px', borderRadius: '4px', cursor: 'not-allowed', fontSize: '12px' },
  planetDataCard: { backgroundColor: '#111724', padding: '12px', borderRadius: '6px', border: '1px solid #23314f', fontSize: '12px', marginTop: '5px', lineHeight: '1.6' },

  controlBox: { display: 'flex', flexDirection: 'column', gap: '12px' },
  btnRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  utilityBtn: { backgroundColor: '#2ed573', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  resetBtn: { backgroundColor: '#ff4757', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  placeholderText: { color: '#a4b0be', fontStyle: 'italic', textAlign: 'center', marginTop: '60px', lineHeight: '1.6', fontSize: '14px' },
  
  outputContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  shipCard: { backgroundColor: '#111724', border: '1px solid #23314f', borderRadius: '6px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
  shipCardHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #23314f', paddingBottom: '8px' },
  statusTransit: { color: '#eccc68', fontSize: '12px', fontWeight: 'bold' },
  statusMining: { color: '#2ed573', fontSize: '12px', fontWeight: 'bold' },
  shipCardStats: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', fontSize: '11px', color: '#cbd2db' },
  
  navigationControlBox: { backgroundColor: '#1b263b', padding: '8px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px' },
  redirectRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' },
  inlineSelect: { backgroundColor: '#0d1527', color: '#fff', border: '1px solid #415a77', padding: '4px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' },
  warningAlert: { backgroundColor: '#4a1525', color: '#ff6b81', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', borderLeft: '4px solid #ff4757', lineHeight: '1.4' }
};