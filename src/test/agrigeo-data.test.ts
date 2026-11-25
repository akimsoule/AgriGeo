import { describe, expect, it } from 'vitest';
import { alerts, commodities, countries, makePriceSeries, priceMeta, tradeValue } from '@/data/agrigeo';

describe('AgriGeo illustrative dataset',()=>{
  it('tracks the nine requested commodities',()=>{
    expect(commodities.map(c=>c.name)).toEqual(['Cacao','Café','Sucre','Huile de palme','Huile de tournesol','Blé','Maïs','Riz','Soja']);
  });
  it('has eight exporters and eight importers per commodity with valid shares',()=>{
    for(const c of commodities){
      expect(c.exporters).toHaveLength(8);expect(c.importers).toHaveLength(8);
      for(const shares of [c.exporters,c.importers]){
        expect(shares.reduce((s,p)=>s+p.share,0)).toBeLessThanOrEqual(100);
        for(const s of shares){expect(s.share).toBeGreaterThan(0);expect(countries.some(p=>p.code===s.code)).toBe(true);}
      }
    }
  });
  it('provides 60 monthly prices and ten concentration years',()=>{
    for(const c of commodities){expect(c.prices).toHaveLength(60);if(!priceMeta){expect(c.prices[0]?.date).toBe('2020-01-01');expect(c.prices[59]?.date).toBe('2024-12-01');}expect(c.concentration.map(p=>p.year)).toEqual([2015,2016,2017,2018,2019,2020,2021,2022,2023,2024]);}
  });
  it('keeps all risk scores and their four components between zero and 100',()=>{
    for(const c of commodities){expect(c.components).toHaveLength(4);for(const value of [c.risk,...c.components]){expect(value).toBeGreaterThanOrEqual(0);expect(value).toBeLessThanOrEqual(100);}}
  });
  it('contains the eight requested alerts',()=>{expect(alerts).toHaveLength(8);expect(new Set(alerts.map(a=>a.type))).toEqual(new Set(['Sécheresse','Conflit','Restriction d’export','Embargo']));});
  it('matches the last price and twelve-month change to the displayed indicators',()=>{
    for(const c of commodities){const last=c.prices[59];const prior=c.prices[47];if(!last||!prior)throw new Error('Missing prices');expect(Math.round(last.value)).toBe(c.price);expect((last.value/prior.value-1)*100).toBeCloseTo(c.change,priceMeta?0:1);}
    expect(makePriceSeries(100,25,0)[47]?.value).toBe(80);
  });
  it('uses the same 2024 shares in the map and commodity details',()=>{const cacao=commodities.find(c=>c.id==='cacao');if(!cacao)throw new Error('Missing cacao');expect(tradeValue(cacao,'CI','export',2024).share).toBe(44);expect(tradeValue(cacao,'GH','export',2024).share).toBe(26);expect(tradeValue(cacao,'CI','export',2015).share).toBe(40.8);});
  it('uses consecutive monthly dates whatever the price source',()=>{
    for(const c of commodities){for(let i=1;i<c.prices.length;i++){const a=new Date(c.prices[i-1]!.date),b=new Date(c.prices[i]!.date);expect((b.getFullYear()-a.getFullYear())*12+b.getMonth()-a.getMonth()).toBe(1);}}
  });
  it('exposes the World Bank provenance when real prices are loaded',()=>{
    if(!priceMeta)return;
    expect(priceMeta.source).toContain('World Bank');expect(priceMeta.lastMonth).toMatch(/^\d{4}-\d{2}-01$/);
    for(const c of commodities)expect(c.prices[59]!.date>=priceMeta.lastMonth).toBe(true);
  });
});
