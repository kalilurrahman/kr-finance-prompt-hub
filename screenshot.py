import asyncio
from playwright.async_api import async_playwright

async def capture_screenshots():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # 1. Home Page & Hero
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        print("Capturing home page...")
        await page.goto('https://kr-finance-prompt-hub.lovable.app/', wait_until='networkidle')
        await page.wait_for_timeout(5000)

        # Take home page
        await page.screenshot(path='public/screenshot-home.png', full_page=True)
        print("Capturing hero section...")
        await page.screenshot(path='public/screenshot-hero.png')

        # Click a card to get prompt detail on home page
        print("Capturing home page prompt detail...")
        pointers = await page.locator('.cursor-pointer').all()
        if pointers:
            for pointer in pointers:
                 if await pointer.is_visible():
                      try:
                           await pointer.click(force=True)
                           print("Clicked cursor pointer")
                           await page.wait_for_timeout(3000)
                           await page.screenshot(path='public/screenshot-prompt-detail.png', full_page=True)

                           # close the modal if possible
                           buttons = await page.locator('button').all()
                           if buttons:
                               await buttons[0].click(force=True)
                               await page.wait_for_timeout(1000)
                           break
                      except Exception as e:
                           print(e)
                           continue


        # 2. Library Page
        print("Capturing library page...")
        await page.goto('https://kr-finance-prompt-hub.lovable.app/library', wait_until='networkidle')
        await page.wait_for_timeout(5000)

        await page.screenshot(path='public/screenshot-library.png', full_page=True)

        print("Checking inputs...")
        inputs = await page.locator('input').all()
        if inputs:
            # First input is likely the search bar based on typical layouts
            await inputs[0].fill('valuation')
            await page.wait_for_timeout(2000)
            await page.screenshot(path='public/screenshot-search.png', full_page=True)


        await browser.close()

asyncio.run(capture_screenshots())
