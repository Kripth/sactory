var count = &10;

<:this>
	<button +click={*count++}>count++</button>
	<button +click={*count--}>count--</button>
	<section>
		Not observable:
		for(var i=0; i<^count; i++) {
			<span>${i}</span>
		}
	</section>
	<section>
		Observable (not optimised):
		for(var i=0; i<*count; i++) {
			<span>${i}</span>
		}
	</section>
</:this>
