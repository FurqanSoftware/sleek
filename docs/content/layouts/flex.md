---
title: Flex
type: docs
weight: 2
---

<h3>Justify Content</h3>

<div class="flow mt-1">
    <div class="flex -jc-right">
        <div style="border:1px solid black;">Justify</div>
        <div style="border:1px solid black;">Content</div>
        <div style="border:1px solid black;">Right</div>
    </div>
    <div class="flex gap-1 -jc-center">
        <div style="border:1px solid black;">Justify</div>
        <div style="border:1px solid black;">Content</div>
        <div style="border:1px solid black;">Center</div>
    </div>
    <div class="flex -jc-around">
        <div style="border:1px solid black;">Justify</div>
        <div style="border:1px solid black;">Content</div>
        <div style="border:1px solid black;">Around</div>
    </div>
</div>

```
<div class="flow">
    <div style="border:1px solid black;" class="flex -jc-center -ai-center">Align Content Center</div>
    <div class="flex -jc-right">
        <div style="border:1px solid black;">Justify</div>
        <div style="border:1px solid black;">Content</div>
        <div style="border:1px solid black;">Start</div>
    </div>
    <div class="flex gap-1 -jc-center">
        <div style="border:1px solid black;">Justify</div>
        <div style="border:1px solid black;">Content</div>
        <div style="border:1px solid black;">Center</div>
    </div>
    <div class="flex -jc-around">
        <div style="border:1px solid black;">Justify</div>
        <div style="border:1px solid black;">Content</div>
        <div style="border:1px solid black;">End</div>
    </div>
</div>
```

<h3>Align Content</h3>

<div style="border:1px solid black;" class="flex -jc-center -ai-center mt-1">Align Content Center</div>

```
<div style="border:1px solid black;" class="flex -jc-center -ai-center">Align Content Center</div>
```
