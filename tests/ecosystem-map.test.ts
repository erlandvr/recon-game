import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrganization } from '../src/organization.ts';
import { placeGroupLabels, scopeRepoIds, ecosystemLayout, fitCamera, mapBounds, zoomCamera, MIN_ZOOM, MAX_ZOOM } from '../src/ecosystemMap.ts';

test('Every seeded repository has a stable, distinct map position and fits the full-world camera', () => {
  for (let seed=1;seed<=100;seed++) {
    const org=createOrganization(seed),layout=ecosystemLayout(org);
    assert.equal(Object.keys(layout.repos).length,100);
    assert.equal(new Set(Object.values(layout.repos).map(p=>`${p.x}:${p.y}`)).size,100);
    for(const size of [{width:890,height:250},{width:360,height:190}]) {
      const points=Object.values(layout.repos),camera=fitCamera(mapBounds(points),size);
      for(const p of points){const x=camera.x+p.x*camera.zoom,y=camera.y+p.y*camera.zoom;assert.ok(x>=0&&x<=size.width&&y>=0&&y<=size.height);}
    }
    assert.deepEqual(ecosystemLayout(org).repos.backend,layout.repos.backend);
  }
});

test('Zoom preserves the world point under the pointer, including at zoom limits', () => {
  const camera={x:130,y:-220,zoom:.3},anchor={x:220,y:190};
  for(const factor of [.5,2,.00001,10000]){
    const next=zoomCamera(camera,anchor,factor);
    assert.ok(next.zoom>=MIN_ZOOM&&next.zoom<=MAX_ZOOM);
    assert.ok(Math.abs((anchor.x-next.x)/next.zoom-(anchor.x-camera.x)/camera.zoom)<1e-8);
    assert.ok(Math.abs((anchor.y-next.y)/next.zoom-(anchor.y-camera.y)/camera.zoom)<1e-8);
  }
});


test('focused group labels remain separate on the shortest project canvas across seeds',()=>{
 for(let seed=1;seed<=100;seed++){
  const org=createOrganization(seed),layout=ecosystemLayout(org),project=org.projects[0],size={width:498,height:116};
  const camera=fitCamera(mapBounds(scopeRepoIds(org,{level:'project',id:project.id}).map(id=>layout.repos[id])),size);
  const labels=project.moduleIds.map(id=>({id,x:layout.modules[id].x*camera.zoom+camera.x,y:layout.modules[id].y*camera.zoom+camera.y,width:Math.min(130,Math.max(64,1100*camera.zoom)),height:camera.zoom<.065?48:64}));
  const result=Object.values(placeGroupLabels(labels,size));
  for(const [i,p] of result.entries()){
   assert.ok(p.x-p.width/2>=0&&p.x+p.width/2<=size.width&&p.y-p.height/2>=0&&p.y+p.height/2<=size.height);
   for(const q of result.slice(i+1))assert.ok(Math.abs(p.x-q.x)>=(p.width+q.width)/2||Math.abs(p.y-q.y)>=(p.height+q.height)/2,`overlapping labels for seed ${seed}`);
  }
 }
});
