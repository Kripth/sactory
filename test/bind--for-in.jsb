var count = 0;
var values = &[count++, count++, count++];

<:this>
	<button +click={*values.push(count++)}>Push</button>
	<button +click={*values.pop()}>Pop</button>
	<button +click={*values.unshift(count++)}>Unshift</button>
	<button +click={*values.shift()}>Shift</button>
	<button +click={*values.splice(2, 1)}>Remove 3rd</button>
	<button +click={*values.splice(3, 1, count++)}>Replace 4th</button>
	<section>
		Not observable:
		for(var i in ^values) {
			var value = *values[i];
			<span>${value}</span>
		}
	</section>
	<section>
		Observable (not optimised):
		for(var i in *values) {
			var value = *values[i];
			var background = Sactory.css.rgb();
			var color = Sactory.css.contrast(background);
			<span &padding="2px 4px" &border-radius="3px" &...{background, color}>${value}</span>
		}
	</section>
</:this>
