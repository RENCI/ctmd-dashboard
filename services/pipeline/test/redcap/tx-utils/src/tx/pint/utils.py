from tx.functional.either import Left, Right
from pint import UnitRegistry
ureg = UnitRegistry()

def convert(v, u, u2):
    if u2 is None:
        return Right(v)
    else:
        if u is None:
            return Left((f"error trying to unitless value {v} without unitful value: {u2}", 403))
        else:
            if u == u2:
                return Right(v)
            else:
                try:
                    return Right((v * ureg.parse_expression(u)).to(ureg.parse_expression(u2)).magnitude)
                except Exception as e:
                    return Left(str(e))
