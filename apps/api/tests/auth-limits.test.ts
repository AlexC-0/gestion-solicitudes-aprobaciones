import { expect, it } from 'vitest';
import { createLoginLimits, Limited } from '../src/auth/limits.js';
it('acota contadores sin expulsar claves activas y los libera por vencimiento',async()=>{
  let now=Date.now();const limiter=createLoginLimits(()=>now,2);
  try {
    await limiter.attempt('uno');await limiter.attempt('dos');
    await expect(limiter.attempt('tres')).rejects.toBeInstanceOf(Limited);
    now+=15*60*1000+1;await expect(limiter.attempt('tres')).resolves.toBeUndefined();
  }finally{limiter.close();}
});