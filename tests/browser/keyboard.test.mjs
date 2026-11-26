// Run with installed Chrome: node --test tests/browser/keyboard.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHarness } from './harness.mjs';
import { recordAudio } from './offline-scenario.mjs';

async function press(tab, key, shift = false) {
  const virtualKey = { Tab: 9, Enter: 13, Escape: 27 }[key];
  const event = { key, code: key, windowsVirtualKeyCode: virtualKey, modifiers: shift ? 8 : 0 };
  await tab.send('Input.dispatchKeyEvent', key === 'Enter'
    ? { ...event, type: 'keyDown', text: '\r', unmodifiedText: '\r' }
    : { ...event, type: 'rawKeyDown' });
  await tab.send('Input.dispatchKeyEvent', { ...event, type: 'keyUp' });
}

async function reachWithTab(tab, selector, { backwards = false, limit = 24 } = {}) {
  const trace = [];
  for (let step = 0; step < limit; step += 1) {
    const active = await tab.evaluate((target) => {
      const element = document.activeElement;
      return { matches: element?.matches(target), tag: element?.tagName, className: element?.className };
    }, selector);
    if (active.matches) return;
    trace.push(`${active.tag}.${active.className}`);
    await press(tab, 'Tab', backwards);
  }
  assert.fail(`Le focus clavier n’a pas atteint ${selector}. Ordre observé ${trace.join(' → ')}`);
}

async function playerTab(browser, width, height, reducedMotion = false) {
  const tab = await browser.openTab();
  await tab.send('Page.bringToFront');
  await tab.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  if (reducedMotion) {
    await tab.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  }
  await tab.navigate('/player?stop=10&hl=fr');
  await tab.waitFor(() => Boolean(document.querySelector('.transcript-viewport .transcript-word')));
  return tab;
}

const focused = (tab) => tab.evaluate(() => {
  const element = document.activeElement;
  return { tag: element?.tagName, className: element?.className, visible: element?.matches(':focus-visible') };
});

async function accessibleControl(tab, selector) {
  const { root } = await tab.send('DOM.getDocument');
  const { nodeId } = await tab.send('DOM.querySelector', { nodeId: root.nodeId, selector });
  assert.ok(nodeId, `Élément absent de la page: ${selector}`);
  const { nodes: [node] } = await tab.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  return { role: node.role?.value, name: node.name?.value, disabled: node.properties?.some(({ name, value }) => name === 'disabled' && value.value === true) ?? false };
}

test('transcript keyboard actions keep focus when their controls leave the DOM', async (context) => {
  const harness = await createHarness();
  try {
    const build = await harness.build('transcript-keyboard');
    const { holdDownload } = await harness.serve(build);
    const browser = await harness.openBrowser({ install: recordAudio });

    await context.test('resuming follow keeps the keyboard in the transcript at 360 px', async () => {
      const tab = await playerTab(browser, 360, 740, true);
      try {
        const setup = await tab.evaluate(() => ({
          width: innerWidth,
          reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
          label: document.querySelector('.transcript-viewport[role="region"]')?.getAttribute('aria-label'),
        }));
        assert.deepEqual(setup, { width: 360, reducedMotion: true, label: 'Transcription synchronisée' });
        await reachWithTab(tab, '.transcript-viewport');
        await tab.waitFor(() => Boolean(document.querySelector('.transcript-resume')));
        await reachWithTab(tab, '.transcript-resume', { backwards: true, limit: 4 });
        assert.equal((await focused(tab)).visible, true);
        await press(tab, 'Enter');
        await tab.waitFor(() => !document.querySelector('.transcript-resume'));
        const after = await focused(tab);
        assert.equal(after.className, 'transcript-viewport', `Focus après réactivation ${JSON.stringify(after)}`);
        assert.equal(after.visible, true);
      } finally {
        await tab.close();
      }
    });

    await context.test('reopening from the cover returns focus to the transcript toggle at 1100 px', async () => {
      const tab = await playerTab(browser, 1100, 900);
      try {
        assert.equal(await tab.evaluate(() => innerWidth), 1100);
        assert.deepEqual(await accessibleControl(tab, '.player-play-button'), { role: 'button', name: 'Écouter', disabled: false });
        await reachWithTab(tab, '.player-view-toggle');
        await press(tab, 'Enter');
        await tab.waitFor(() => document.querySelector('.player-view-toggle')?.getAttribute('aria-expanded') === 'false');
        await reachWithTab(tab, '.player-resting-cover button');
        assert.equal((await focused(tab)).visible, true);
        await press(tab, 'Enter');
        await tab.waitFor(() => document.querySelector('.player-view-toggle')?.getAttribute('aria-expanded') === 'true');
        const after = await focused(tab);
        assert.equal(after.className, 'player-view-toggle', `Focus après réouverture ${JSON.stringify(after)}`);
        assert.equal(after.visible, true);

        await tab.navigate('/player?stop=09&hl=fr');
        await tab.waitFor(() => document.querySelector('.player-play-button')?.disabled === true);
        assert.deepEqual(await accessibleControl(tab, '.player-play-button'), { role: 'button', name: 'Écouter', disabled: true });
      } finally {
        await tab.close();
      }
    });

    await context.test('Escape closes the named player settings dialog and restores focus', async () => {
      const tab = await playerTab(browser, 360, 740, true);
      try {
        await reachWithTab(tab, '.player-settings-button');
        await press(tab, 'Enter');
        await tab.waitFor(() => Boolean(document.querySelector('dialog.player-settings[open]')?.contains(document.activeElement)));
        const dialog = await accessibleControl(tab, 'dialog.player-settings[open]');
        assert.equal(dialog.role, 'dialog');
        assert.ok(dialog.name?.trim());
        await press(tab, 'Escape');
        await tab.waitFor(() => !document.querySelector('dialog.player-settings[open]') &&
          Boolean(document.activeElement?.matches('.player-settings-button:focus-visible')));
      } finally {
        await tab.close();
      }
    });

    await context.test('the compact player keeps its exhibit action reachable and its transcript readable', async () => {
      for (const [width, height] of [[360, 540], [667, 375]]) {
        const tab = await playerTab(browser, width, height, true);
        try {
          const layout = await tab.evaluate(() => {
            const button = document.querySelector('.player-detail-link');
            const rect = button.getBoundingClientRect();
            const transcript = document.querySelector('.transcript-viewport');
            const wordGroup = transcript.querySelector('[role="group"]');
            return {
              width: rect.width, height: rect.height,
              reachable: button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)),
              readingHeight: transcript.clientHeight,
              firstParagraph: wordGroup.textContent,
            };
          });
          assert.ok(layout.width >= 44 && layout.height >= 44 && layout.reachable, JSON.stringify(layout));
          assert.ok(layout.readingHeight >= 44, JSON.stringify(layout));
          assert.match(layout.firstParagraph, /Dans le sud normand, là où nous habitions avec mon père, une unité allemande dénommée la Panzer Lehr avait établi son quartier général dans cette région\./);
          assert.deepEqual(await accessibleControl(tab, '.player-detail-link'), { role: 'button', name: 'Récit & Histoire', disabled: false });
          if (width > height) {
            await tab.click('header button[aria-label="Agrandir le texte"]');
            await tab.waitFor(() => document.documentElement.classList.contains('large-text'));
            for (let step = 0; step < 7; step += 1) {
              const size = await tab.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.synced-transcript-phrase')).fontSize));
              if (size >= 30) break;
              await tab.click('.player-text-size button:last-child');
              await tab.waitFor((previous) => parseFloat(getComputedStyle(document.querySelector('.synced-transcript-phrase')).fontSize) > previous, size);
            }
            const enlarged = await tab.evaluate(() => {
              const title = document.querySelector('.player-station h2');
              const viewport = document.querySelector('.transcript-viewport');
              const button = document.querySelector('.player-detail-link');
              const rect = button.getBoundingClientRect();
              const transport = document.querySelector('.player-transport').getBoundingClientRect();
              return {
                title: title.textContent, titleHeight: title.clientHeight, titleScroll: title.scrollHeight,
                clearsControls: title.getBoundingClientRect().bottom <= transport.top,
                readingHeight: viewport.clientHeight,
                textSize: getComputedStyle(viewport.querySelector('.synced-transcript-phrase')).fontSize,
                reachable: button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)),
              };
            });
            assert.match(enlarged.title, /les armes secrètes.*bâtisse délabrée/i);
            assert.ok(enlarged.titleScroll <= enlarged.titleHeight + 1 && enlarged.clearsControls, JSON.stringify(enlarged));
            assert.equal(enlarged.textSize, '30px');
            assert.ok(enlarged.readingHeight >= 44 && enlarged.reachable, JSON.stringify(enlarged));
            context.diagnostic(`${width}×${height}px agrandi, titre ${enlarged.titleHeight}px intégral et lecture ${enlarged.readingHeight}px à ${enlarged.textSize}.`);
            await tab.click('header button[aria-label="Agrandir le texte"]');
          }
          await tab.waitFor(() => window.__ddayFixtureAudio.some((audio) => audio.currentSrc.includes('/audio/fr/stop-10.mp3') && audio.readyState >= 1));
          await tab.click('.transcript-viewport .transcript-word');
          const decoration = await tab.waitFor(() => {
            const currentWord = document.querySelector('.transcript-word[aria-current="true"]');
            return currentWord && getComputedStyle(currentWord).textDecorationLine;
          });
          assert.equal(decoration, 'underline');
          await reachWithTab(tab, '.player-detail-link', { backwards: true });
          assert.equal((await focused(tab)).visible, true);
          await press(tab, 'Enter');
          await tab.waitFor(() => location.pathname === '/stop/10');
          context.diagnostic(`${width}×${height}px, zone de lecture ${layout.readingHeight}px et lien fiche ${layout.width}×${layout.height}px.`);
        } finally {
          await tab.close();
        }
      }
      const tab = await browser.openTab();
      try {
        await tab.send('Emulation.setDeviceMetricsOverride', { width: 360, height: 540, deviceScaleFactor: 1, mobile: false });
        await tab.navigate('/player?stop=09&hl=pl');
        const provenance = await tab.waitFor(() => {
          const note = document.querySelector('.player-narration-provenance');
          const compact = note?.querySelector('.player-provenance-short');
          return compact?.getClientRects().length && {
            label: note.innerText, fullyVisible: note.scrollHeight <= note.clientHeight + 1,
          };
        });
        assert.deepEqual(provenance, { label: 'Głos syntetyczny · nieoficjalne tłumaczenie', fullyVisible: true });
      } finally {
        await tab.close();
      }
    });

    await context.test('the keyboard opens the offline panel and its progress is exposed', async () => {
      const tab = await browser.openTab();
      let release;
      try {
        await tab.send('Page.bringToFront');
        await tab.navigate('/?hl=fr');
        await tab.waitFor(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
        if (!await tab.evaluate(() => Boolean(navigator.serviceWorker.controller))) await tab.reload();
        await tab.waitFor(() => document.documentElement.lang === 'fr' && navigator.serviceWorker.controller?.state === 'activated' &&
          Boolean(document.querySelector('.offline-manager summary')));
        await reachWithTab(tab, '.offline-manager summary');
        await tab.evaluate(() => {
          const panel = document.querySelector('.offline-manager');
          let started = false;
          const observer = new MutationObserver(() => {
            const status = panel.querySelector('[role="status"][aria-live="polite"]');
            const checking = status?.textContent.includes('Vérification des fichiers');
            if (checking) started = true;
            if (started && !checking && panel.querySelector('.offline-actions button')?.disabled === false) {
              window.__ddayFixtureInspectionFinished = true;
              observer.disconnect();
            }
          });
          observer.observe(panel, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['disabled'] });
        });
        await press(tab, 'Enter');
        await tab.waitFor(() => window.__ddayFixtureInspectionFinished === true && document.querySelector('.offline-manager')?.open &&
          document.querySelector('.offline-actions button')?.disabled === false);
        assert.deepEqual(await accessibleControl(tab, '.offline-manager progress'), { role: 'progressbar', name: 'vérifiés', disabled: false });

        release = holdDownload('/audio/fr/stop-10.mp3');
        await reachWithTab(tab, '.offline-actions button:first-child');
        await press(tab, 'Enter');
        await tab.waitFor(() => document.querySelector('.offline-manager [role="status"][aria-live="polite"][aria-atomic="true"]')?.innerText.includes('Téléchargement en cours'));
        release();
        release = undefined;
        await tab.waitFor(() => {
          const panel = document.querySelector('.offline-manager');
          const progress = panel?.querySelector('progress');
          return progress?.max > 0 && progress.value === progress.max &&
            panel.querySelector('[role="status"][aria-live="polite"]')?.innerText.includes('Visite prête hors connexion');
        });
      } finally {
        release?.();
        await tab.close();
      }
    });
    context.diagnostic(browser.product);
  } finally {
    await harness.close();
  }
});
