#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix route ordering in Ticket.controller.ts"""

filepath = r'C:\Users\might\PICKS\gateways\api\admin\Ticket\Ticket.controller.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix: Add a comment to the /:number route warning about route ordering
old = """  // Single ticket by ID number (legacy - ticketId param matches by number)
  router.get('/:number', async (req: Request, res: Response): Promise<void> => {"""

new = """  // Single ticket by ID number (legacy - ticketId param matches by number)
  // NOTE: This route MUST stay AFTER sub-resource routes (/:ticketId/comments, etc.)
  router.get('/:number', async (req: Request, res: Response): Promise<void> => {"""

if old in content:
    content = content.replace(old, new, 1)
    print("Step 1: Added ordering note to /:number route")
else:
    print("Step 1: Pattern not found, trying alternate...")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done - Step 1 written")
