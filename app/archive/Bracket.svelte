<div class="bracket">
    <div class="nub"></div>
    <div class="line"></div>
</div>

<style>
    .bracket {
        display: grid;
        grid-template-columns: auto auto 1fr;
        grid-template-rows: 1fr;
        place-content: stretch;
        place-items: stretch;
    }

    .nub {
        width: 0.5em;
        height: 0.25em;
        background-color: var(--stsv-common__color--subtle);
        align-self: center;
    }

    .line {
        width: 1em;
        border-left: 0.25em solid var(--stsv-common__color--subtle);
        border-top: 0.25em solid var(--stsv-common__color--subtle);
        border-bottom: 0.25em solid var(--stsv-common__color--subtle);
    }

    
</style>