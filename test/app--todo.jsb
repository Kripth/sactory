var data = (&[]).localStorage("__test_todo");
var input = &;

var add = () => {
	if(*input) {
		*data.push({
			id: Math.floor(Math.random() * 1000000),
			content: *input
		});
		*input = "";
	}
};

var remove = id => *data.splice(*data.findIndex(a => a.id == id), 1);

<:this>
	<form +submit:prevent=add>
		<input *text=input />
		<button>Add</button>
	</form>
	<table>
		foreach(*data as {id, content}) {
			<tr>
				<td ~text=content />
				<td +click={remove(id)}>&times;</td>
			</tr>
		}
	</table>
</:this>